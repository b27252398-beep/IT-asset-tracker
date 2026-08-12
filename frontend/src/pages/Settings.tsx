import { Shield, Bell, Key, Database, Globe } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure global application preferences and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <nav className="flex flex-col space-y-1">
            <a href="#" className="bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 px-4 py-3 text-sm font-medium flex items-center">
              <Globe className="w-5 h-5 mr-3 text-indigo-600" />
              General
            </a>
            <a href="#" className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent px-4 py-3 text-sm font-medium flex items-center transition-colors">
              <Shield className="w-5 h-5 mr-3 text-slate-400" />
              Security
            </a>
            <a href="#" className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent px-4 py-3 text-sm font-medium flex items-center transition-colors">
              <Bell className="w-5 h-5 mr-3 text-slate-400" />
              Notifications
            </a>
            <a href="#" className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent px-4 py-3 text-sm font-medium flex items-center transition-colors">
              <Key className="w-5 h-5 mr-3 text-slate-400" />
              API Keys
            </a>
            <a href="#" className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent px-4 py-3 text-sm font-medium flex items-center transition-colors">
              <Database className="w-5 h-5 mr-3 text-slate-400" />
              Database Config
            </a>
          </nav>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">General Settings</h3>
              <p className="mt-1 text-sm text-slate-500">Update your organization's primary information.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Organization Name</label>
                <input type="text" defaultValue="Acme Corp" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Support Email</label>
                <input type="email" defaultValue="it-support@acmecorp.com" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Timezone</label>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option>Pacific Time (PT)</option>
                  <option>Eastern Time (ET)</option>
                  <option>Coordinated Universal Time (UTC)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3">
                  Cancel
                </button>
                <button className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
