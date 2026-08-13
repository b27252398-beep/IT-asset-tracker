import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, Plus, Search, Edit2, Trash2, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSoftware, createSoftware, updateSoftware, deleteSoftware } from '../api/softwareApi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function Software() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [newLicense, setNewLicense] = useState({ name: "", publisher: "", licenseKey: "", seatsTotal: 1, expiryDate: "" });
  const [editLicense, setEditLicense] = useState<any>(null);

  // Queries
  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ['software'],
    queryFn: fetchSoftware
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createSoftware,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      setIsAddModalOpen(false);
      setNewLicense({ name: "", publisher: "", licenseKey: "", seatsTotal: 1, expiryDate: "" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => updateSoftware(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      setIsEditModalOpen(false);
      setEditLicense(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSoftware,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...newLicense,
      expiryDate: newLicense.expiryDate || undefined
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLicense) return;
    updateMutation.mutate({
      id: editLicense.id,
      updates: {
        ...editLicense,
        expiryDate: editLicense.expiryDate || undefined
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this license?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string, expiryDate: string) => {
    if (status === 'REVOKED') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Revoked</span>;
    }
    
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1"/> Expired</span>;
    }
    
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1"/> Active</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Software Licenses</h1>
          <p className="text-sm text-slate-500 mt-1">Manage software keys, SaaS subscriptions, and seat allocations</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search software..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add License
          </button>
        </div>
      </div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Software</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">License Key</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Seats</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expiry</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {licenses.map((license: any) => {
                const percentUsed = Math.min(100, Math.round((license.seatsAllocated / license.seatsTotal) * 100));
                
                return (
                  <motion.tr 
                    key={license.id} 
                    className="hover:bg-slate-50/50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                          <Key className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{license.name}</div>
                          <div className="text-sm text-slate-500">{license.publisher}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                        {license.licenseKey || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full max-w-[150px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 font-medium">{license.seatsAllocated} / {license.seatsTotal} used</span>
                          <span className="text-slate-400">{percentUsed}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${percentUsed >= 100 ? 'bg-red-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${percentUsed}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(license.status, license.expiryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'Lifetime'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setEditLicense(license);
                          setIsEditModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mx-2 p-1 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(license.id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          
          {licenses.length === 0 && (
            <div className="py-12 text-center">
              <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No software licenses</h3>
              <p className="text-slate-500 mt-1">Get started by adding your first software license.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Key className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">Add Software License</h3>
                    <form onSubmit={handleAddSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Software Name</label>
                        <input type="text" required value={newLicense.name} onChange={e => setNewLicense({...newLicense, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Adobe Creative Cloud" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Publisher</label>
                        <input type="text" required value={newLicense.publisher} onChange={e => setNewLicense({...newLicense, publisher: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Adobe" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">License Key</label>
                        <input type="text" value={newLicense.licenseKey} onChange={e => setNewLicense({...newLicense, licenseKey: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="XXXX-XXXX-XXXX-XXXX" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Total Seats</label>
                          <input type="number" min="1" required value={newLicense.seatsTotal} onChange={e => setNewLicense({...newLicense, seatsTotal: parseInt(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
                          <input type="date" value={newLicense.expiryDate} onChange={e => setNewLicense({...newLicense, expiryDate: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                      </div>
                      <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6 border-t border-slate-100">
                        <button type="submit" disabled={createMutation.isPending} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm cursor-pointer disabled:opacity-50">
                          {createMutation.isPending ? 'Saving...' : 'Add License'}
                        </button>
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editLicense && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Edit2 className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">Edit Software License</h3>
                    <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Software Name</label>
                        <input type="text" required value={editLicense.name} onChange={e => setEditLicense({...editLicense, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Publisher</label>
                        <input type="text" required value={editLicense.publisher} onChange={e => setEditLicense({...editLicense, publisher: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">License Key</label>
                        <input type="text" value={editLicense.licenseKey || ''} onChange={e => setEditLicense({...editLicense, licenseKey: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Total Seats</label>
                          <input type="number" min="1" required value={editLicense.seatsTotal} onChange={e => setEditLicense({...editLicense, seatsTotal: parseInt(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Allocated Seats</label>
                          <input type="number" min="0" required value={editLicense.seatsAllocated} onChange={e => setEditLicense({...editLicense, seatsAllocated: parseInt(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
                          <input type="date" value={editLicense.expiryDate ? editLicense.expiryDate.split('T')[0] : ""} onChange={e => setEditLicense({...editLicense, expiryDate: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Status</label>
                          <select value={editLicense.status} onChange={e => setEditLicense({...editLicense, status: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="ACTIVE">Active</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="REVOKED">Revoked</option>
                          </select>
                        </div>
                      </div>
                      <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6 border-t border-slate-100">
                        <button type="submit" disabled={updateMutation.isPending} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm cursor-pointer disabled:opacity-50">
                          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
