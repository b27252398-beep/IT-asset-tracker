import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Plus, Search, Edit2, Trash2, AlertTriangle, CheckCircle, PackageOpen
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchConsumables, createConsumable, updateConsumable, deleteConsumable } from '../api/consumableApi';

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

export default function Consumables() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [newItem, setNewItem] = useState({ name: "", category: "Accessories", quantity: 0, reorderPoint: 5, cost: "" });
  const [editItem, setEditItem] = useState<any>(null);

  // Queries
  const { data: consumables = [], isLoading } = useQuery({
    queryKey: ['consumables'],
    queryFn: fetchConsumables
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createConsumable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumables'] });
      setIsAddModalOpen(false);
      setNewItem({ name: "", category: "Accessories", quantity: 0, reorderPoint: 5, cost: "" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => updateConsumable(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumables'] });
      setIsEditModalOpen(false);
      setEditItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteConsumable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumables'] });
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newItem);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    updateMutation.mutate({
      id: editItem.id,
      updates: editItem
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(id);
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Consumables Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Track mice, keyboards, cables, and other unassigned items</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity Available</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Cost</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {consumables.map((item: any) => {
                const isLowStock = item.quantity <= item.reorderPoint;

                return (
                  <motion.tr 
                    key={item.id} 
                    className="hover:bg-slate-50/50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${isLowStock ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{item.quantity}</div>
                      <div className="text-xs text-slate-500">Reorder at {item.reorderPoint}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{item.cost ? `$${item.cost.toFixed(2)}` : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.quantity === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3 mr-1"/> Low Stock</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1"/> In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setEditItem(item);
                          setIsEditModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mx-2 p-1 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
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
          
          {consumables.length === 0 && (
            <div className="py-12 text-center">
              <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No consumables in inventory</h3>
              <p className="text-slate-500 mt-1">Get started by adding keyboards, mice, or cables.</p>
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
                    <Package className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">Add Consumable</h3>
                    <form onSubmit={handleAddSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Item Name</label>
                        <input type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Logitech Wireless Mouse" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Category</label>
                        <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                          <option value="Accessories">Accessories (Mouse, Keyboard)</option>
                          <option value="Cables">Cables & Adapters</option>
                          <option value="Office Supplies">Office Supplies (Ink, Paper)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Initial Quantity</label>
                          <input type="number" min="0" required value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Reorder Point</label>
                          <input type="number" min="0" required value={newItem.reorderPoint} onChange={e => setNewItem({...newItem, reorderPoint: parseInt(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Unit Cost ($)</label>
                        <input type="number" step="0.01" min="0" value={newItem.cost} onChange={e => setNewItem({...newItem, cost: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 29.99" />
                      </div>
                      <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6 border-t border-slate-100">
                        <button type="submit" disabled={createMutation.isPending} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm cursor-pointer disabled:opacity-50">
                          {createMutation.isPending ? 'Saving...' : 'Add Item'}
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
      {isEditModalOpen && editItem && (
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
                    <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">Edit Consumable</h3>
                    <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Item Name</label>
                        <input type="text" required value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Category</label>
                        <select value={editItem.category} onChange={e => setEditItem({...editItem, category: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                          <option value="Accessories">Accessories (Mouse, Keyboard)</option>
                          <option value="Cables">Cables & Adapters</option>
                          <option value="Office Supplies">Office Supplies (Ink, Paper)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Quantity Available</label>
                          <input type="number" min="0" required value={editItem.quantity} onChange={e => setEditItem({...editItem, quantity: parseInt(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Reorder Point</label>
                          <input type="number" min="0" required value={editItem.reorderPoint} onChange={e => setEditItem({...editItem, reorderPoint: parseInt(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Unit Cost ($)</label>
                        <input type="number" step="0.01" min="0" value={editItem.cost === null ? "" : editItem.cost} onChange={e => setEditItem({...editItem, cost: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
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
