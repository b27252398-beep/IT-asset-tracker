import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, Plus, Search, CheckCircle, XCircle, Clock, MessageSquare, Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApprovals, createApproval, updateApproval, deleteApproval } from '../api/approvalApi';

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

export default function Approvals() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newReq, setNewReq] = useState({ title: "", requestorName: "", requestedItem: "", status: "PENDING", comments: "" });

  // Queries
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: fetchApprovals
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      setIsAddModalOpen(false);
      setNewReq({ title: "", requestorName: "", requestedItem: "", status: "PENDING", comments: "" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => updateApproval(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newReq);
  };

  const handleStatusChange = (req: any, newStatus: string) => {
    if (confirm(`Are you sure you want to ${newStatus.toLowerCase()} this request?`)) {
      updateMutation.mutate({
        id: req.id,
        updates: { ...req, status: newStatus }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this request record?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3.5 h-3.5 mr-1"/> Pending</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3.5 h-3.5 mr-1"/> Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5 mr-1"/> Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Split approvals by status for Kanban-like feel, or just list them. We'll use a responsive grid of cards.
  return (
    <motion.div 
      className="space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Approval Workflows</h1>
          <p className="text-sm text-slate-500 mt-1">Manage IT requests and provisioning approvals</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvals.map((req: any) => (
          <motion.div 
            key={req.id} 
            variants={itemVariants}
            className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-200
              ${req.status === 'PENDING' ? 'bg-white border-slate-200 hover:border-indigo-300' : ''}
              ${req.status === 'APPROVED' ? 'bg-emerald-50/30 border-emerald-100' : ''}
              ${req.status === 'REJECTED' ? 'bg-red-50/30 border-red-100' : ''}
            `}
          >
            <div className="p-5 border-b border-slate-100/50 flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-1">{req.requestedItem}</h3>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">{req.title}</h2>
              </div>
              {getStatusBadge(req.status)}
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Requestor</p>
                <p className="text-sm font-medium text-slate-900 flex items-center mt-0.5">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs mr-2 font-bold">
                    {req.requestorName.charAt(0)}
                  </span>
                  {req.requestorName}
                </p>
              </div>
              
              {req.comments && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-xs text-slate-500 flex items-center mb-1 font-semibold uppercase"><MessageSquare className="w-3 h-3 mr-1"/> Justification / Comments</p>
                  <p className="text-sm text-slate-700 italic">"{req.comments}"</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Created: {new Date(req.createdAt).toLocaleDateString()}</span>
              
              <div className="flex space-x-2">
                {req.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleStatusChange(req, 'APPROVED')}
                      className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(req, 'REJECTED')}
                      className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button 
                  onClick={() => handleDelete(req.id)}
                  className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 rounded-md transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {approvals.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No Pending Approvals</h3>
            <p className="text-slate-500 mt-1">Submit a new request to trigger an approval workflow.</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </button>
          </div>
        )}
      </div>

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
                    <CheckSquare className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">Submit New Request</h3>
                    <form onSubmit={handleAddSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Request Title *</label>
                        <input type="text" required value={newReq.title} onChange={e => setNewReq({...newReq, title: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. New Developer Laptop" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Requestor Name *</label>
                          <input type="text" required value={newReq.requestorName} onChange={e => setNewReq({...newReq, requestorName: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. John Doe" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Requested Item / Category *</label>
                          <input type="text" required value={newReq.requestedItem} onChange={e => setNewReq({...newReq, requestedItem: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. MacBook Pro M3" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Justification / Comments</label>
                        <textarea rows={3} value={newReq.comments} onChange={e => setNewReq({...newReq, comments: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Why is this needed?"></textarea>
                      </div>
                      <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6 border-t border-slate-100">
                        <button type="submit" disabled={createMutation.isPending} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm cursor-pointer disabled:opacity-50">
                          {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
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
    </motion.div>
  );
}
