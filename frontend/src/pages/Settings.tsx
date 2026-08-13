import { Shield, Bell, Key, Database, Globe } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("General");
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure global application preferences and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <nav className="flex flex-col space-y-1">
            <button onClick={() => setActiveTab("General")} className={`text-left px-4 py-3 text-sm font-medium flex items-center transition-colors ${activeTab === 'General' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'}`}>
              <Globe className={`w-5 h-5 mr-3 ${activeTab === 'General' ? 'text-indigo-600' : 'text-slate-400'}`} />
              General
            </button>
            <button onClick={() => setActiveTab("Security")} className={`text-left px-4 py-3 text-sm font-medium flex items-center transition-colors ${activeTab === 'Security' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'}`}>
              <Shield className={`w-5 h-5 mr-3 ${activeTab === 'Security' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Security
            </button>
            <button onClick={() => setActiveTab("Notifications")} className={`text-left px-4 py-3 text-sm font-medium flex items-center transition-colors ${activeTab === 'Notifications' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'}`}>
              <Bell className={`w-5 h-5 mr-3 ${activeTab === 'Notifications' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Notifications
            </button>
            <button onClick={() => setActiveTab("API Keys")} className={`text-left px-4 py-3 text-sm font-medium flex items-center transition-colors ${activeTab === 'API Keys' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'}`}>
              <Key className={`w-5 h-5 mr-3 ${activeTab === 'API Keys' ? 'text-indigo-600' : 'text-slate-400'}`} />
              API Keys
            </button>
            <button onClick={() => setActiveTab("Database Config")} className={`text-left px-4 py-3 text-sm font-medium flex items-center transition-colors ${activeTab === 'Database Config' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'}`}>
              <Database className={`w-5 h-5 mr-3 ${activeTab === 'Database Config' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Database Config
            </button>
          </nav>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">{activeTab} Settings</h3>
              <p className="mt-1 text-sm text-slate-500">Update your organization's {activeTab.toLowerCase()} configuration.</p>
            </div>
            
            <div className="p-6 space-y-6">
              {activeTab === "General" ? (
                <>
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
                </>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <Globe className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-sm font-medium text-slate-900">{activeTab} preferences</h3>
                  <p className="mt-1 text-sm text-slate-500">This configuration module is not yet connected to the backend.</p>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => console.log("Settings change cancelled.")}
                  className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => console.log("Settings successfully saved!")}
                  className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
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
