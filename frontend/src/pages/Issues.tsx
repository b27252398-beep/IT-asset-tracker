import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, AlertCircle, AlertTriangle, AlertOctagon, Info,
  CheckCircle, Clock, Trash2, X, ChevronRight, Send, Wrench,
  ThumbsUp, ThumbsDown, ArrowRight, PlayCircle, ShieldCheck, Users
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchIssues, createIssue, acceptIssue, rejectIssue,
  forwardIssue, markInProgress, resolveIssue, deleteIssue
} from '../api/issueApi';
import { fetchAssets } from '../api/assetApi';
import { fetchEmployees } from '../api/employeeApi';
import { useAuthStore } from '../store/authStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    OPEN:        { label: 'Open',        cls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300',   icon: <Clock className="w-3 h-3 mr-1" /> },
    ACCEPTED:    { label: 'Accepted',    cls: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300', icon: <ThumbsUp className="w-3 h-3 mr-1" /> },
    REJECTED:    { label: 'Rejected',    cls: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',       icon: <ThumbsDown className="w-3 h-3 mr-1" /> },
    ASSIGNED:    { label: 'Assigned',    cls: 'bg-purple-100 text-purple-800', icon: <Send className="w-3 h-3 mr-1" /> },
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300',     icon: <PlayCircle className="w-3 h-3 mr-1" /> },
    RESOLVED:    { label: 'Resolved',    cls: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  };
  const s = map[status] || { label: status, cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200', icon: null };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

// ─── Priority Badge ──────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    CRITICAL: { label: 'Critical', cls: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300',    icon: <AlertOctagon className="w-3 h-3 mr-1" /> },
    HIGH:     { label: 'High',     cls: 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300', icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
    MEDIUM:   { label: 'Medium',   cls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300',  icon: <AlertCircle className="w-3 h-3 mr-1" /> },
    LOW:      { label: 'Low',      cls: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300',    icon: <Info className="w-3 h-3 mr-1" /> },
  };
  const p = map[priority] || { label: priority, cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200', icon: null };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${p.cls}`}>
      {p.icon}{p.label}
    </span>
  );
}

// ─── Workflow Progress Bar ───────────────────────────────────────────────────
function WorkflowBar({ status }: { status: string }) {
  const steps = ['OPEN', 'ACCEPTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
  if (status === 'REJECTED') {
    return (
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1"><ThumbsDown className="w-3 h-3"/>Ticket was rejected</span>
      </div>
    );
  }
  const current = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-2">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${i <= current ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Modal Wrapper ───────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Ticket Card ─────────────────────────────────────────────────────────────
function TicketCard({
  req, userRole, onAccept, onReject, onForward, onProgress, onResolve, onDelete
}: {
  req: any;
  userRole: string;
  onAccept?: () => void;
  onReject?: () => void;
  onForward?: () => void;
  onProgress?: () => void;
  onResolve?: () => void;
  onDelete?: () => void;
}) {
  return (
    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">{req.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Asset: <span className="font-medium text-slate-700 dark:text-slate-200">{req.asset?.name || 'Unknown'}</span> ({req.asset?.assetTag || '—'})</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusBadge status={req.status} />
            <PriorityBadge priority={req.priority} />
          </div>
        </div>
        <WorkflowBar status={req.status} />
      </div>

      {/* Body */}
      <div className="p-5 flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 text-xs">Reported by</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{req.employee?.name || 'Unknown'}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase mb-1">Issue</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-3">{req.description}</p>
        </div>
        {req.techNote && (
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Tech Team Note</p>
            <p className="text-sm text-purple-900">{req.techNote}</p>
          </div>
        )}
        {req.resolvedNote && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 border border-emerald-100 dark:border-emerald-500/30">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase mb-1">Resolution</p>
            <p className="text-sm text-emerald-900">{req.resolvedNote}</p>
          </div>
        )}
        {req.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-3 border border-red-100 dark:border-red-500/30">
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase mb-1">Rejection Reason</p>
            <p className="text-sm text-red-900">{req.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50/80 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
        <div className="flex items-center gap-2">
          {/* ADMIN actions */}
          {userRole === 'ADMIN' && req.status === 'OPEN' && (
            <>
              <button onClick={onAccept} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded-lg hover:bg-indigo-200 transition-colors">
                <ThumbsUp className="w-3 h-3" />Accept
              </button>
              <button onClick={onReject} className="flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors">
                <ThumbsDown className="w-3 h-3" />Reject
              </button>
            </>
          )}
          {userRole === 'ADMIN' && req.status === 'ACCEPTED' && (
            <button onClick={onForward} className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg hover:bg-purple-200 transition-colors">
              <ArrowRight className="w-3 h-3" />Forward to Tech
            </button>
          )}
          {userRole === 'ADMIN' && (
            <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {/* TECH_TEAM actions */}
          {userRole === 'TECH_TEAM' && req.status === 'ASSIGNED' && (
            <button onClick={onProgress} className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors">
              <PlayCircle className="w-3 h-3" />Start Work
            </button>
          )}
          {userRole === 'TECH_TEAM' && req.status === 'IN_PROGRESS' && (
            <button onClick={onResolve} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition-colors">
              <ShieldCheck className="w-3 h-3" />Resolve
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Issues() {
  const queryClient = useQueryClient();
  const userRole = useAuthStore(state => state.userRole);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen]       = useState(false);
  const [rejectTarget, setRejectTarget]           = useState<any>(null);
  const [forwardTarget, setForwardTarget]         = useState<any>(null);
  const [resolveTarget, setResolveTarget]         = useState<any>(null);
  const [rejectionReason, setRejectionReason]     = useState('');
  const [techNote, setTechNote]                   = useState('');
  const [resolvedNote, setResolvedNote]           = useState('');

  // New ticket form state
  const [newReq, setNewReq] = useState({ title: '', description: '', priority: 'MEDIUM', assetId: '', employeeId: '' });

  // Queries
  const { data: issues = [], isLoading } = useQuery({ queryKey: ['issues'], queryFn: fetchIssues });
  const { data: assets = [] }            = useQuery({ queryKey: ['assets'], queryFn: () => fetchAssets() });
  const { data: employees = [] }         = useQuery({ queryKey: ['employees'], queryFn: () => fetchEmployees() });

  // Mutations
  const createMutation   = useMutation({ mutationFn: createIssue,   onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['issues'] }); setIsAddModalOpen(false); setNewReq({ title: '', description: '', priority: 'MEDIUM', assetId: '', employeeId: '' }); } });
  const acceptMutation   = useMutation({ mutationFn: (id: string) => acceptIssue(id),         onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }) });
  const deleteMutation   = useMutation({ mutationFn: (id: string) => deleteIssue(id),         onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }) });
  const progressMutation = useMutation({ mutationFn: (id: string) => markInProgress(id),      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }) });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectIssue(id, reason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['issues'] }); setRejectTarget(null); setRejectionReason(''); }
  });
  const forwardMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => forwardIssue(id, note),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['issues'] }); setForwardTarget(null); setTechNote(''); }
  });
  const resolveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => resolveIssue(id, note),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['issues'] }); setResolveTarget(null); setResolvedNote(''); }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const validIssues = Array.isArray(issues) ? issues : [];

  // Filter by role
  const roleFilteredIssues = userRole === 'TECH_TEAM'
    ? validIssues.filter((i: any) => ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(i.status))
    : validIssues;

  const filteredIssues = roleFilteredIssues.filter((i: any) =>
    i.title?.toLowerCase().includes(search.toLowerCase())
  );

  const roleTitle = userRole === 'ADMIN' ? 'All Tickets' : userRole === 'TECH_TEAM' ? 'Assigned Tickets' : 'My Tickets';
  const roleSubtitle = userRole === 'ADMIN'
    ? 'Review, accept, reject and forward tickets to the technical team'
    : userRole === 'TECH_TEAM'
    ? 'Work on tickets assigned to you by the admin'
    : 'Submit and track your asset issue requests';

  return (
    <motion.div className="space-y-6 pb-12" variants={containerVariants} initial="hidden" animate="visible">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Helpdesk — {roleTitle}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{roleSubtitle}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text" placeholder="Search tickets…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {userRole === 'EMPLOYEE' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
            >
              <Plus className="w-4 h-4" />Report Issue
            </button>
          )}
        </div>
      </div>

      {/* Workflow Guide Banner */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-xs text-slate-500 dark:text-slate-400 shadow-sm overflow-x-auto">
        <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0">Workflow:</span>
        {['Employee Submits', 'Admin Reviews', 'Admin Forwards', 'Tech Works', 'Resolved'].map((s, i, arr) => (
          <React.Fragment key={s}>
            <span className={`shrink-0 px-2 py-0.5 rounded-full font-medium ${
              (userRole === 'EMPLOYEE' && i === 0) || (userRole === 'ADMIN' && i === 1) || (userRole === 'ADMIN' && i === 2) || (userRole === 'TECH_TEAM' && i === 3)
                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>{s}</span>
            {i < arr.length - 1 && <ChevronRight className="w-3 h-3 shrink-0 text-slate-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredIssues.map((req: any) => (
          <TicketCard
            key={req.id}
            req={req}
            userRole={userRole}
            onAccept={() => acceptMutation.mutate(req.id)}
            onReject={() => setRejectTarget(req)}
            onForward={() => setForwardTarget(req)}
            onProgress={() => progressMutation.mutate(req.id)}
            onResolve={() => setResolveTarget(req)}
            onDelete={() => { if (confirm('Delete this ticket?')) deleteMutation.mutate(req.id); }}
          />
        ))}
        {filteredIssues.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">No tickets found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              {userRole === 'EMPLOYEE' ? 'You haven\'t submitted any issues yet.' : 'Nothing to action right now.'}
            </p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════ */}

      {/* Employee: Submit New Ticket */}
      {isAddModalOpen && (
        <Modal title="Report New Issue" onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={e => { e.preventDefault(); createMutation.mutate(newReq); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Reporting Employee</label>
              <select required value={newReq.employeeId} onChange={e => setNewReq({ ...newReq, employeeId: e.target.value })}
                className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select your name…</option>
                {(Array.isArray(employees) ? employees : []).map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Affected Asset</label>
              <select required value={newReq.assetId} onChange={e => setNewReq({ ...newReq, assetId: e.target.value })}
                className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select asset…</option>
                {(Array.isArray(assets) ? assets : []).map((asset: any) => (
                  <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetTag})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Issue Title</label>
              <input type="text" required value={newReq.title} onChange={e => setNewReq({ ...newReq, title: e.target.value })}
                placeholder="e.g. Laptop screen flickering" className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Priority</label>
              <select required value={newReq.priority} onChange={e => setNewReq({ ...newReq, priority: e.target.value })}
                className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🟠 High</option>
                <option value="CRITICAL">🔴 Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Detailed Description</label>
              <textarea required value={newReq.description} onChange={e => setNewReq({ ...newReq, description: e.target.value })}
                rows={3} placeholder="Describe the problem in detail…"
                className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-900/50">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                {createMutation.isPending ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Admin: Reject Modal */}
      {rejectTarget && (
        <Modal title={`Reject: "${rejectTarget.title}"`} onClose={() => { setRejectTarget(null); setRejectionReason(''); }}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">Please provide a reason for rejecting this ticket. The employee will see this reason.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Rejection Reason</label>
              <textarea rows={3} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Not enough information provided, please resubmit with asset details…"
                className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setRejectTarget(null); setRejectionReason(''); }} className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-900/50">Cancel</button>
              <button
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate({ id: rejectTarget.id, reason: rejectionReason })}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Rejecting…' : 'Reject Ticket'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin: Forward to Tech Team Modal */}
      {forwardTarget && (
        <Modal title={`Forward to Tech Team: "${forwardTarget.title}"`} onClose={() => { setForwardTarget(null); setTechNote(''); }}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">Add a note for the technical team explaining what they need to investigate or fix.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Note for Tech Team</label>
              <textarea rows={3} value={techNote} onChange={e => setTechNote(e.target.value)}
                placeholder="e.g. Please replace the faulty hard drive. Asset is in Room 204."
                className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setForwardTarget(null); setTechNote(''); }} className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-900/50">Cancel</button>
              <button
                disabled={!techNote.trim() || forwardMutation.isPending}
                onClick={() => forwardMutation.mutate({ id: forwardTarget.id, note: techNote })}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {forwardMutation.isPending ? 'Forwarding…' : 'Forward to Tech Team'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Tech Team: Resolve Modal */}
      {resolveTarget && (
        <Modal title={`Resolve: "${resolveTarget.title}"`} onClose={() => { setResolveTarget(null); setResolvedNote(''); }}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">Describe what action you took to resolve this issue.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Resolution Notes</label>
              <textarea rows={3} value={resolvedNote} onChange={e => setResolvedNote(e.target.value)}
                placeholder="e.g. Replaced the hard drive with a new 512GB SSD. Asset is back in service."
                className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setResolveTarget(null); setResolvedNote(''); }} className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-900/50">Cancel</button>
              <button
                disabled={!resolvedNote.trim() || resolveMutation.isPending}
                onClick={() => resolveMutation.mutate({ id: resolveTarget.id, note: resolvedNote })}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {resolveMutation.isPending ? 'Resolving…' : 'Mark as Resolved'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </motion.div>
  );
}
