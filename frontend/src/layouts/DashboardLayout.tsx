import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Laptop2, Users, Settings, LogOut, Bell, Key, Building2, Package, ShoppingCart, MapPin, Calendar, CheckSquare, Activity, Monitor, QrCode, LifeBuoy, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import ChatBot from "../components/ChatBot";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const { userRole, setRole } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // Define which roles can see each module
  // ADMIN = all | EMPLOYEE = limited | TECH_TEAM = technical focus
  const navigation = [
    { name: "Dashboard",       href: "/",               icon: LayoutDashboard, roles: ["ADMIN", "EMPLOYEE", "TECH_TEAM"] },
    { name: "Assets",          href: "/assets",          icon: Laptop2,         roles: ["ADMIN", "TECH_TEAM"] },
    { name: "Software",        href: "/software",        icon: Key,             roles: ["ADMIN"] },
    { name: "Vendors",         href: "/vendors",         icon: Building2,       roles: ["ADMIN"] },
    { name: "Consumables",     href: "/consumables",     icon: Package,         roles: ["ADMIN"] },
    { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart,    roles: ["ADMIN"] },
    { name: "Facilities",      href: "/locations",       icon: MapPin,          roles: ["ADMIN"] },
    { name: "Schedules",       href: "/schedules",       icon: Calendar,        roles: ["ADMIN"] },
    { name: "Approvals",       href: "/approvals",       icon: CheckSquare,     roles: ["ADMIN"] },
    { name: "Helpdesk",        href: "/issues",          icon: LifeBuoy,        roles: ["ADMIN", "EMPLOYEE", "TECH_TEAM"] },
    { name: "Scanner",         href: "/scanner",         icon: QrCode,          roles: ["ADMIN", "EMPLOYEE", "TECH_TEAM"] },
    { name: "Audit Logs",      href: "/audit-logs",      icon: Activity,        roles: ["ADMIN"] },
    { name: "Employees",       href: "/employees",       icon: Users,           roles: ["ADMIN"] },
    { name: "Settings",        href: "/settings",        icon: Settings,        roles: ["ADMIN", "EMPLOYEE", "TECH_TEAM"] },
  ];

  // Filter navigation based on the current role
  const visibleNavigation = navigation.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-950 text-slate-900 dark:text-white dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10">
        <div className="h-16 flex items-center px-6 font-bold text-xl tracking-tight text-white border-b border-slate-800">
          <Monitor className="w-6 h-6 mr-2 text-indigo-400" />
          <span>ITAMS Core</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {visibleNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Role Switcher for Testing */}
        <div className="px-4 py-4">
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2 uppercase tracking-wider">Test RBAC</p>
            <div className="flex rounded-md p-1 bg-slate-900 border border-slate-700 gap-0.5">
              <button 
                onClick={() => setRole('ADMIN')}
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors cursor-pointer ${userRole === 'ADMIN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 dark:text-slate-500 hover:text-slate-300'}`}
              >
                Admin
              </button>
              <button 
                onClick={() => setRole('EMPLOYEE')}
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors cursor-pointer ${userRole === 'EMPLOYEE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 dark:text-slate-500 hover:text-slate-300'}`}
              >
                Staff
              </button>
              <button 
                onClick={() => setRole('TECH_TEAM')}
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors cursor-pointer ${userRole === 'TECH_TEAM' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 dark:text-slate-500 hover:text-slate-300'}`}
              >
                Tech
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div 
            onClick={() => {
              useAuthStore.getState().logout();
              navigate('/portal');
            }}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white mr-3">
              {useAuthStore.getState().user?.name 
                ? useAuthStore.getState().user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
                : 'JD'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-white">{useAuthStore.getState().user?.name || 'John Doe'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{userRole === 'ADMIN' ? 'IT Administrator' : userRole === 'TECH_TEAM' ? 'Technical Support' : 'Staff Employee'}</p>
            </div>
            <LogOut className="w-4 h-4 ml-2" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200 relative cursor-pointer"
              title="Toggle Dark Mode"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-400 relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-900 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 dark:text-white">Notifications</h3>
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">2 New</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    <div className="p-4 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 dark:text-white">Low Stock Alert</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Printer Ink (Black) is below minimum threshold (3 remaining).</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">10 minutes ago</p>
                    </div>
                    <div className="p-4 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 dark:text-white">New Ticket Assigned</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Ticket #ISS-4092 has been assigned to your queue.</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">2 hours ago</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-900 text-center">
                    <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-300">Mark all as read</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      <ChatBot />
    </div>
  );
}
