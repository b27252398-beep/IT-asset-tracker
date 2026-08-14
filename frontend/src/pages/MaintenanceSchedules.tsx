import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Plus, Search, Edit2, Trash2, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMaintenanceSchedules, createMaintenanceSchedule, updateMaintenanceSchedule, deleteMaintenanceSchedule } from '../api/maintenanceScheduleApi';

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
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export default function MaintenanceSchedules() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [newSched, setNewSched] = useState({ title: "", description: "", frequency: "MONTHLY", nextDueDate: "", status: "ACTIVE" });
  const [editSched, setEditSched] = useState<any>(null);

  // Queries
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['maintenance-schedules'],
    queryFn: fetchMaintenanceSchedules
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMaintenanceSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
      setIsAddModalOpen(false);
      setNewSched({ title: "", description: "", frequency: "MONTHLY", nextDueDate: "", status: "ACTIVE" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => updateMaintenanceSchedule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
      setIsEditModalOpen(false);
      setEditSched(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaintenanceSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...newSched,
      nextDueDate: newSched.nextDueDate || undefined
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSched) return;
    updateMutation.mutate({
      id: editSched.id,
      updates: {
        ...editSched,
        nextDueDate: editSched.nextDueDate || undefined
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this maintenance schedule?")) {
      deleteMutation.mutate(id);
    }
  };

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    return date < now;
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Maintenance Schedules</h1>
          <p className="text-sm text-slate-500 mt-1">Manage recurring IT tasks and checkups</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search schedules..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </button>
        </div>
      </div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Task</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Frequency</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Due</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {schedules.map((sched: any) => {
                const overdue = sched.status === 'ACTIVE' && isOverdue(sched.nextDueDate);
                
                return (
                  <motion.tr 
                    key={sched.id} 
                    className={`hover:bg-slate-50/50 transition-colors ${overdue ? 'bg-red-50/30' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${overdue ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{sched.title}</div>
                          {sched.description && <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">{sched.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        <Clock className="w-3 h-3 mr-1"/> {sched.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sched.nextDueDate ? (
                        <div className={`flex items-center text-sm font-medium ${overdue ? 'text-red-600' : 'text-slate-900'}`}>
                          {overdue && <AlertTriangle className="w-4 h-4 mr-1.5" />}
                          {new Date(sched.nextDueDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sched.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1"/> Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1"/> Paused</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setEditSched(sched);
                          setIsEditModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mx-2 p-1 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(sched.id)}
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
          
          {schedules.length === 0 && (
            <div className="py-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No Maintenance Schedules</h3>
              <p className="text-slate-500 mt-1">Create your first schedule to start tracking recurring tasks.</p>
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
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Calendar className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">Create Schedule</h3>
                    <form onSubmit={handleAddSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Title</label>
                        <input type="text" required value={newSched.title} onChange={e => setNewSched({...newSched, title: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Quarterly Server Patching" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea rows={3} value={newSched.description} onChange={e => setNewSched({...newSched, description: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Details about the task..."></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Frequency</label>
                          <select value={newSched.frequency} onChange={e => setNewSched({...newSched, frequency: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="QUARTERLY">Quarterly</option>
                            <option value="ANNUALLY">Annually</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Next Due Date</label>
                          <input type="date" required value={newSched.nextDueDate} onChange={e => setNewSched({...newSched, nextDueDate: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                      </div>
                      <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6 border-t border-slate-100">
                        <button type="submit" disabled={createMutation.isPending} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm cursor-pointer disabled:opacity-50">
                          {createMutation.isPending ? 'Saving...' : 'Create Schedule'}
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
      {isEditModalOpen && editSched && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Edit2 className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">Edit Schedule</h3>
                    <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Title</label>
                        <input type="text" required value={editSched.title} onChange={e => setEditSched({...editSched, title: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea rows={3} value={editSched.description || ""} onChange={e => setEditSched({...editSched, description: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Frequency</label>
                          <select value={editSched.frequency} onChange={e => setEditSched({...editSched, frequency: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="QUARTERLY">Quarterly</option>
                            <option value="ANNUALLY">Annually</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Next Due Date</label>
                          <input type="date" required value={editSched.nextDueDate ? editSched.nextDueDate.split('T')[0] : ""} onChange={e => setEditSched({...editSched, nextDueDate: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <select value={editSched.status} onChange={e => setEditSched({...editSched, status: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                          <option value="ACTIVE">Active</option>
                          <option value="PAUSED">Paused</option>
                        </select>
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
