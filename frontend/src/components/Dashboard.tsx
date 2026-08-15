import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { fetchDashboardMetrics, fetchAssets, fetchWarrantyAlerts, downloadAssetsCSV } from "../api/assetApi";
import { Monitor, CheckCircle, Wrench, XCircle, ArrowUpRight, ShieldCheck, Laptop2, Server, AlertTriangle, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

// Charts data will be driven directly from the backend via fetchDashboardMetrics

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const exportToPDF = () => {
    const element = document.getElementById('dashboard-content');
    if(element) {
      toast.success('Generating PDF Report...');
      html2pdf().from(element).save('IT_Asset_Report.pdf');
    }
  };
  const { userRole } = useAuthStore();
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["dashboardMetrics"],
    queryFn: fetchDashboardMetrics,
  });

  const { data: recentAssets, isLoading: isAssetsLoading } = useQuery({
    queryKey: ["assets", "recent"],
    queryFn: () => fetchAssets(),
  });

  const { data: alerts, isLoading: isAlertsLoading } = useQuery({
    queryKey: ["warrantyAlerts"],
    queryFn: fetchWarrantyAlerts,
  });

  if (isMetricsLoading || isAssetsLoading || isAlertsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Assets", value: metrics?.TOTAL || 0, icon: Monitor, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10 dark:bg-indigo-500/20" },
    { title: "Available", value: metrics?.AVAILABLE || 0, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 dark:bg-emerald-500/20" },
    { title: "In Repair", value: metrics?.IN_REPAIR || 0, icon: Wrench, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 dark:bg-amber-500/20" },
    { title: "Retired", value: metrics?.RETIRED || 0, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const activityData = metrics?.activityData || [];
  const categoryData = metrics?.categoryData || [];

  return (
    <motion.div 
      id="dashboard-content"
      className="space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm mt-1">Real-time metrics and asset utilization across your organization.</p>
        </div>
        {userRole !== 'EMPLOYEE' && (
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={exportToPDF}
              className="flex-1 sm:flex-none flex items-center justify-center bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-500/30 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/50 focus:ring-4 focus:ring-indigo-100 transition-colors shadow-sm cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export to PDF
            </button>
            <button 
              onClick={downloadAssetsCSV}
              className="flex-1 sm:flex-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-700/50 focus:ring-4 focus:ring-slate-100 transition-colors shadow-sm cursor-pointer"
            >
              Download Report
            </button>
            <button 
              onClick={() => navigate('/assets')}
              className="flex-1 sm:flex-none flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-colors shadow-sm cursor-pointer"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Provision Asset
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">{stat.value}</h3>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                12%
              </span>
              <span className="text-slate-400 dark:text-slate-500 ml-2">vs last month</span>
            </div>
            
            {/* Decorative gradient blur */}
            <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${stat.bg.replace('bg-', 'bg-')}`}></div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Provisioning Activity</h3>
              <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">Assignments vs Returns this week</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {activityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 italic">No activity data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="assignments" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAssignments)" />
                  <Area type="monotone" dataKey="returns" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorReturns)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Categories Chart */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Hardware Distribution</h3>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">Assets by category</p>
          </div>
          <div className="flex-1 min-h-[200px]">
            {categoryData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 italic mt-8">No assets in inventory</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--tw-prose-body, #fff)', color: 'inherit' }}
                  />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {categoryData.map((cat: any) => (
              <div key={cat.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                <span className="text-sm text-slate-600 dark:text-slate-300">{cat.name} ({cat.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Warranty Alerts Section */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Warranty Alerts</h2>
          </div>
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 dark:bg-amber-500/20 px-3 py-1 rounded-full">
            {alerts.expiringSoon.length + alerts.expired.length} Alerts
          </span>
        </div>

        <div className="space-y-4">
          {alerts.expired.length === 0 && alerts.expiringSoon.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 dark:text-slate-500 italic">No warranty alerts at this time.</div>
          ) : (
            <>
              {alerts.expired.map((asset: any) => (
                <div key={asset.id} className="flex items-center justify-between p-4 rounded-xl border border-red-100 dark:border-red-500/30 bg-red-50/30 dark:bg-red-500/10">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">{asset.name} <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 font-normal ml-2">({asset.assetTag})</span></h4>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">Warranty expired on {new Date(asset.warrantyExpiry).toLocaleDateString()}</p>
                  </div>
                  {userRole !== 'EMPLOYEE' && (
                    <button onClick={() => navigate(`/assets?view=${asset.id}`)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:text-indigo-300 font-medium cursor-pointer">View Asset</button>
                  )}
                </div>
              ))}
              
              {alerts.expiringSoon.map((asset: any) => {
                const daysLeft = Math.ceil((new Date(asset.warrantyExpiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                return (
                  <div key={asset.id} className="flex items-center justify-between p-4 rounded-xl border border-amber-100 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 dark:bg-amber-500/20/30">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">{asset.name} <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 font-normal ml-2">({asset.assetTag})</span></h4>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Expires in {daysLeft} days ({new Date(asset.warrantyExpiry).toLocaleDateString()})</p>
                    </div>
                    {userRole !== 'EMPLOYEE' && (
                      <button onClick={() => navigate(`/assets?view=${asset.id}`)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:text-indigo-300 font-medium cursor-pointer">View Asset</button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </motion.div>

      {/* Recent Assets Table */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Inventory</h3>
          {userRole !== 'EMPLOYEE' && (
            <button onClick={() => navigate('/assets')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer">View All</button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 font-medium">Asset Tag</th>
                <th className="px-6 py-4 font-medium">Model</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentAssets?.slice(0, 5).map((asset: any) => (
                <tr key={asset.id} className="hover:bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-700/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                    <div className="flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors" />
                      {asset.assetTag}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{asset.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      {asset.category === 'LAPTOP' ? <Laptop2 className="w-3 h-3 mr-1" /> : <Server className="w-3 h-3 mr-1" />}
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      asset.status === 'AVAILABLE' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                      asset.status === 'ASSIGNED' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30' :
                      asset.status === 'IN_REPAIR' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' :
                      'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        asset.status === 'AVAILABLE' ? 'bg-emerald-50 dark:bg-emerald-500/10 dark:bg-emerald-500/200' :
                        asset.status === 'ASSIGNED' ? 'bg-blue-500' :
                        asset.status === 'IN_REPAIR' ? 'bg-amber-50 dark:bg-amber-500/10 dark:bg-amber-500/200' :
                        'bg-rose-500'
                      }`}></span>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    {asset.currentUser ? (
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold mr-2">
                          {asset.currentUser.charAt(0)}
                        </div>
                        {asset.currentUser}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!recentAssets || recentAssets.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    No assets found in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
