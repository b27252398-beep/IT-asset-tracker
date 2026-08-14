import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Plus, Search, Edit2, Trash2, Clock, CheckCircle, Truck, XCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from '../api/purchaseOrderApi';

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

export default function PurchaseOrders() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [newPO, setNewPO] = useState({ poNumber: "", vendorName: "", status: "PENDING", totalAmount: "", orderDate: "" });
  const [editPO, setEditPO] = useState<any>(null);

  // Queries
  const { data: pos = [], isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: fetchPurchaseOrders
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setIsAddModalOpen(false);
      setNewPO({ poNumber: "", vendorName: "", status: "PENDING", totalAmount: "", orderDate: "" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => updatePurchaseOrder(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setIsEditModalOpen(false);
      setEditPO(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...newPO,
      totalAmount: newPO.totalAmount || "0",
      orderDate: newPO.orderDate || undefined
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPO) return;
    updateMutation.mutate({
      id: editPO.id,
      updates: {
        ...editPO,
        orderDate: editPO.orderDate || undefined
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this purchase order?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1"/> Approved</span>;
      case 'DELIVERED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><Truck className="w-3 h-3 mr-1"/> Delivered</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Track procurement of assets and inventory</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search POs..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create PO
          </button>
        </div>
      </div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PO Number</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Amount</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {pos.map((po: any) => (
                <motion.tr 
                  key={po.id} 
                  className="hover:bg-slate-50/50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-indigo-600">#{po.poNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{po.vendorName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500">{po.orderDate ? new Date(po.orderDate).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">${po.totalAmount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(po.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => {
                        setEditPO(po);
                        setIsEditModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mx-2 p-1 hover:bg-indigo-50 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(po.id)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {pos.length === 0 && (
            <div className="py-12 text-center">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No Purchase Orders</h3>
              <p className="text-slate-500 mt-1">Create your first purchase order to start tracking procurement.</p>
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
                    <ShoppingCart className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">Create Purchase Order</h3>
                    <form onSubmit={handleAddSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">PO Number</label>
                        <input type="text" required value={newPO.poNumber} onChange={e => setNewPO({...newPO, poNumber: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="PO-2023-001" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Vendor Name</label>
                        <input type="text" required value={newPO.vendorName} onChange={e => setNewPO({...newPO, vendorName: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Dell Inc." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Order Date</label>
                          <input type="date" required value={newPO.orderDate} onChange={e => setNewPO({...newPO, orderDate: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Total Amount ($)</label>
                          <input type="number" step="0.01" min="0" required value={newPO.totalAmount} onChange={e => setNewPO({...newPO, totalAmount: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="0.00" />
                        </div>
                      </div>
                      <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6 border-t border-slate-100">
                        <button type="submit" disabled={createMutation.isPending} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm cursor-pointer disabled:opacity-50">
                          {createMutation.isPending ? 'Saving...' : 'Create PO'}
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
      {isEditModalOpen && editPO && (
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
                    <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">Edit Purchase Order</h3>
                    <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">PO Number</label>
                        <input type="text" required value={editPO.poNumber} onChange={e => setEditPO({...editPO, poNumber: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Vendor Name</label>
                        <input type="text" required value={editPO.vendorName} onChange={e => setEditPO({...editPO, vendorName: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Order Date</label>
                          <input type="date" required value={editPO.orderDate ? editPO.orderDate.split('T')[0] : ""} onChange={e => setEditPO({...editPO, orderDate: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Total Amount ($)</label>
                          <input type="number" step="0.01" min="0" required value={editPO.totalAmount} onChange={e => setEditPO({...editPO, totalAmount: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <select value={editPO.status} onChange={e => setEditPO({...editPO, status: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
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
