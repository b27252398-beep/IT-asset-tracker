import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Search, Filter, ShieldAlert, Clock, User, HardDrive, Database, Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAuditLogs, createAuditLog } from '../api/auditLogApi';

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

export default function AuditLogs() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  // Queries
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: fetchAuditLogs
  });

  // For testing purposes: allow manual creation of a log
  const createMutation = useMutation({
    mutationFn: createAuditLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    }
  });

  const generateTestLog = () => {
    const actions = ["STATUS_CHANGE", "EDIT", "ASSIGN", "UNASSIGN"];
    
    createMutation.mutate({
      action: actions[Math.floor(Math.random() * actions.length)],
      assetId: "test-asset-id-1234",
      performedBy: "SystemAdmin",
      details: "Simulated audit event generated for testing."
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300">CREATE</span>;
      case 'UPDATE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">UPDATE</span>;
      case 'DELETE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300">DELETE</span>;
      case 'LOGIN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">LOGIN</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100">{action}</span>;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'user': return <User className="w-4 h-4 text-slate-400" />;
      case 'asset': return <HardDrive className="w-4 h-4 text-slate-400" />;
      case 'system': return <ShieldAlert className="w-4 h-4 text-slate-400" />;
      default: return <Database className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredLogs = logs.filter((log: any) => {
    const user = log.performedBy || log.userName || "";
    const type = "Asset";
    const details = log.details || "";
    
    const matchesSearch = user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === "ALL" || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
            Immutable Audit Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Read-only historical tracking of all system activity</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search user, entity, details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">Creates</option>
              <option value="UPDATE">Updates</option>
              <option value="DELETE">Deletes</option>
              <option value="LOGIN">Logins</option>
            </select>
          </div>
          <button 
            onClick={generateTestLog}
            className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm text-sm font-medium"
            title="Generates a mock log for testing purposes"
          >
            <Plus className="w-4 h-4 mr-2" />
            Test Event
          </button>
        </div>
      </div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entity</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-700">
              {filteredLogs.map((log: any) => (
                <motion.tr 
                  key={log.id} 
                  className="hover:bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">{(log.performedBy || log.userName || "?").charAt(0)}</span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{log.performedBy || log.userName || "Unknown User"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-900 dark:text-white font-medium">
                      {getEntityIcon('asset')}
                      <span className="ml-2">Asset</span>
                      {log.assetId && <span className="ml-1 text-slate-400 font-normal">#{log.assetId.slice(0,8)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400 max-w-md truncate" title={log.details}>
                      {log.details || "-"}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredLogs.length === 0 && (
            <div className="py-12 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No logs found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {logs.length === 0 ? "The audit ledger is currently empty." : "No logs match your search/filter criteria."}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
