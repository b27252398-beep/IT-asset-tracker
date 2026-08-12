import { useQuery } from "@tanstack/react-query";
import { fetchDashboardMetrics, fetchAssets } from "../api/assetApi";
import { Monitor, CheckCircle, Wrench, XCircle, ArrowUpRight, ShieldCheck, Laptop2, Server } from "lucide-react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

// Mock data for charts until backend Analytics module is built
const activityData = [
  { name: 'Mon', assignments: 4, returns: 2 },
  { name: 'Tue', assignments: 7, returns: 1 },
  { name: 'Wed', assignments: 3, returns: 5 },
  { name: 'Thu', assignments: 8, returns: 3 },
  { name: 'Fri', assignments: 5, returns: 4 },
];

const categoryData = [
  { name: 'Laptops', value: 45, color: '#4f46e5' },
  { name: 'Desktops', value: 20, color: '#06b6d4' },
  { name: 'Monitors', value: 35, color: '#8b5cf6' },
  { name: 'Servers', value: 10, color: '#f59e0b' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function Dashboard() {
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["dashboardMetrics"],
    queryFn: fetchDashboardMetrics,
  });

  const { data: recentAssets, isLoading: isAssetsLoading } = useQuery({
    queryKey: ["assets", "recent"],
    queryFn: () => fetchAssets(),
  });

  if (isMetricsLoading || isAssetsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Assets", value: metrics?.TOTAL || 0, icon: Monitor, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Available", value: metrics?.AVAILABLE || 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "In Repair", value: metrics?.IN_REPAIR || 0, icon: Wrench, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Retired", value: metrics?.RETIRED || 0, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <motion.div 
      className="space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time metrics and asset utilization across your organization.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            Download Report
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center">
            <Monitor className="w-4 h-4 mr-2" />
            Provision Asset
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</h3>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 flex items-center font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                12%
              </span>
              <span className="text-slate-400 ml-2">vs last month</span>
            </div>
            
            {/* Decorative gradient blur */}
            <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${stat.bg.replace('bg-', 'bg-')}`}></div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Provisioning Activity</h3>
              <p className="text-slate-500 text-sm">Assignments vs Returns this week</p>
            </div>
          </div>
          <div className="h-72 w-full">
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
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="assignments" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAssignments)" />
                <Area type="monotone" dataKey="returns" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorReturns)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Categories Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Hardware Distribution</h3>
            <p className="text-slate-500 text-sm">Assets by category</p>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                <span className="text-sm text-slate-600">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Assets Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">Recent Inventory</h3>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 font-medium">Asset Tag</th>
                <th className="px-6 py-4 font-medium">Model</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentAssets?.slice(0, 5).map((asset: any) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    <div className="flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      {asset.assetTag}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{asset.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {asset.category === 'LAPTOP' ? <Laptop2 className="w-3 h-3 mr-1" /> : <Server className="w-3 h-3 mr-1" />}
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      asset.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      asset.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      asset.status === 'IN_REPAIR' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        asset.status === 'AVAILABLE' ? 'bg-emerald-500' :
                        asset.status === 'ASSIGNED' ? 'bg-blue-500' :
                        asset.status === 'IN_REPAIR' ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}></span>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {asset.currentUser ? (
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-2">
                          {asset.currentUser.charAt(0)}
                        </div>
                        {asset.currentUser}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!recentAssets || recentAssets.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
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
