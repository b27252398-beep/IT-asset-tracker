import { Shield, Bell, Key, Database, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("General");
  const [emailNotif, setEmailNotif] = useState(true);
  const [warrantyAlert, setWarrantyAlert] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure global application preferences and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <nav className="flex flex-col space-y-1">
            <button onClick={() => setActiveTab("General")} className={`text-left px-4 py-3 text-sm font-medium flex items-center transition-colors ${activeTab === 'General' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-white border-l-4 border-transparent'}`}>
              <Globe className={`w-5 h-5 mr-3 ${activeTab === 'General' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              General
            </button>
            <button onClick={() => setActiveTab("Security")} className={`text-left px-4 py-3 text-sm font-medium flex items-center transition-colors ${activeTab === 'Security' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-white border-l-4 border-transparent'}`}>
              <Shield className={`w-5 h-5 mr-3 ${activeTab === 'Security' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              Security
            </button>
            <button onClick={() => setActiveTab("Notifications")} className={`text-left px-4 py-3 text-sm font-medium flex items-center transition-colors ${activeTab === 'Notifications' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-white border-l-4 border-transparent'}`}>
              <Bell className={`w-5 h-5 mr-3 ${activeTab === 'Notifications' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              Notifications
            </button>
            <button onClick={() => setActiveTab("API Keys")} className={`text-left px-4 py-3 text-sm font-medium flex items-center transition-colors ${activeTab === 'API Keys' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-white border-l-4 border-transparent'}`}>
              <Key className={`w-5 h-5 mr-3 ${activeTab === 'API Keys' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              API Keys
            </button>
            <button onClick={() => setActiveTab("Database Config")} className={`text-left px-4 py-3 text-sm font-medium flex items-center transition-colors ${activeTab === 'Database Config' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-white border-l-4 border-transparent'}`}>
              <Database className={`w-5 h-5 mr-3 ${activeTab === 'Database Config' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              Database Config
            </button>
          </nav>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">{activeTab} Settings</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your organization's {activeTab.toLowerCase()} configuration.</p>
            </div>
            
            <div className="p-6 space-y-6">
              {activeTab === "General" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Organization Name</label>
                    <input type="text" defaultValue="Acme Corp" className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Support Email</label>
                    <input type="email" defaultValue="it-support@acmecorp.com" className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Timezone</label>
                    <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      <option>Pacific Time (PT)</option>
                      <option>Eastern Time (ET)</option>
                      <option>Coordinated Universal Time (UTC)</option>
                    </select>
                  </div>
                </>
              ) : activeTab === "Notifications" ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts when new issues are reported or assets are assigned.</p>
                    </div>
                    <button onClick={() => setEmailNotif(!emailNotif)} className={`${emailNotif ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}>
                      <span className={`${emailNotif ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">Warranty Expiry Alerts</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Send an email digest 30 days before asset warranties expire.</p>
                    </div>
                    <button onClick={() => setWarrantyAlert(!warrantyAlert)} className={`${warrantyAlert ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}>
                      <span className={`${warrantyAlert ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Slack / Teams Webhook URL</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input type="text" defaultValue="https://example.com/slack-webhook-placeholder" className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Used for pushing high-priority alerts instantly to your team chat.</p>
                  </div>
                </div>
              ) : activeTab === "Security" ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Require all users to use 2FA when logging in.</p>
                    </div>
                    <button onClick={() => setTwoFactor(!twoFactor)} className={`${twoFactor ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}>
                      <span className={`${twoFactor ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                    </button>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Session Timeout (Minutes)</label>
                    <input type="number" defaultValue="30" className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                  </div>
                </div>
              ) : activeTab === "API Keys" ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Active API Keys</h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-700 font-mono text-sm break-all text-slate-600 dark:text-slate-300 flex justify-between items-center">
                      <span>sk_live_9f8d7b6a5c4e3d2f1a0b...</span>
                      <span onClick={() => toast.success("API key copied to clipboard!")} className="text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">Copy</span>
                    </div>
                  </div>
                  <button onClick={() => toast.success("New API key generated!")} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none cursor-pointer">
                    Generate New Key
                  </button>
                </div>
              ) : activeTab === "Database Config" ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Database Connection String</label>
                    <input type="password" defaultValue="postgres://user:pass@localhost:5432/itams" className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">Enable Automated Backups</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Run database backups daily at 2:00 AM UTC.</p>
                    </div>
                    <button onClick={() => setAutoBackup(!autoBackup)} className={`${autoBackup ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}>
                      <span className={`${autoBackup ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => toast.error("Changes discarded.")}
                  className="bg-white dark:bg-slate-900 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => toast.success("Settings successfully saved!")}
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
