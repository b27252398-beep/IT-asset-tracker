import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Laptop2, Users, Settings, LogOut, Bell, Key, Building2, Package, ShoppingCart, MapPin, Calendar, CheckSquare, Activity } from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const { userRole, setRole } = useAuthStore();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Assets", href: "/assets", icon: Laptop2 },
    { name: "Software", href: "/software", icon: Key },
    { name: "Vendors", href: "/vendors", icon: Building2 },
    { name: "Consumables", href: "/consumables", icon: Package },
    { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
    { name: "Facilities", href: "/locations", icon: MapPin },
    { name: "Schedules", href: "/schedules", icon: Calendar },
    { name: "Approvals", href: "/approvals", icon: CheckSquare },
    { name: "Audit Logs", href: "/audit-logs", icon: Activity },
    { name: "Employees", href: "/employees", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10">
        <div className="h-16 flex items-center px-6 font-bold text-xl tracking-tight text-white border-b border-slate-800">
          <Monitor className="w-6 h-6 mr-2 text-indigo-400" />
          <span>ITAMS Core</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
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
                <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Role Switcher for Testing */}
        <div className="px-4 py-4">
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Test RBAC</p>
            <div className="flex rounded-md p-1 bg-slate-900 border border-slate-700">
              <button 
                onClick={() => setRole('ADMIN')}
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors cursor-pointer ${userRole === 'ADMIN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-300'}`}
              >
                Admin
              </button>
              <button 
                onClick={() => setRole('EMPLOYEE')}
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors cursor-pointer ${userRole === 'EMPLOYEE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-300'}`}
              >
                Employee
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div 
            onClick={() => {
              useAuthStore.getState().logout();
            }}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white mr-3">
              JD
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-slate-500">{userRole === 'ADMIN' ? 'IT Administrator' : 'Staff Employee'}</p>
            </div>
            <LogOut className="w-4 h-4 ml-2" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-0">
          <h1 className="text-xl font-semibold text-slate-800">
            {navigation.find(n => n.href === location.pathname)?.name || "Portal"}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                  </div>
                  <div className="p-4 text-sm text-slate-500 text-center">
                    You're all caught up! No new notifications.
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
