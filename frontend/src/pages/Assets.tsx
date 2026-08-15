import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAssets, createAsset, updateAsset, checkOutAsset, checkInAsset, fetchAssetLogs, fetchMaintenanceLogs, createMaintenanceRecord, updateMaintenanceRecord, downloadAssetsCSV, importAssetsCSV, fetchAssetDocuments, uploadAssetDocument } from "../api/assetApi";
import { fetchEmployees } from "../api/employeeApi";
import { useAuthStore } from "../store/authStore";
import { QRCodeSVG } from "qrcode.react";
import { Plus, Search, Filter, Monitor, Laptop, Smartphone, Server, X, Printer, Download, Upload, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function Assets() {
  const { userRole } = useAuthStore();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [submitError, setSubmitError] = useState("");
  const [newAsset, setNewAsset] = useState({ name: "", assetTag: "", category: "LAPTOP", location: "", warrantyExpiry: "" });
  const [viewAsset, setViewAsset] = useState<any>(null);
  const [editAsset, setEditAsset] = useState<any>(null);
  const [editError, setEditError] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [checkOutAssetId, setCheckOutAssetId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [assetLogs, setAssetLogs] = useState<any[]>([]);
  const [assetMaintenance, setAssetMaintenance] = useState<any[]>([]);
  const [assetDocuments, setAssetDocuments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'MAINTENANCE' | 'DOCUMENTS' | 'LIFECYCLE'>('DETAILS');
  const [newRepair, setNewRepair] = useState({ issueDescription: "", cost: "" });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadAssets();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (assets.length > 0) {
      const viewId = searchParams.get('view');
      if (viewId && (!viewAsset || viewAsset.id !== viewId)) {
        const found = assets.find(a => a.id === viewId);
        if (found) {
          handleViewAsset(found);
        }
      }
    }
  }, [assets, searchParams, viewAsset]);

  const loadAssets = async () => {
    try {
      const data = await fetchAssets();
      setAssets(data);
    } catch (error) {
      console.error("Failed to load assets", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    try {
      await createAsset({ ...newAsset, warrantyExpiry: newAsset.warrantyExpiry || undefined });
      setIsAddModalOpen(false);
      setNewAsset({ name: "", assetTag: "", category: "LAPTOP", location: "", warrantyExpiry: "" });
      loadAssets(); // refresh list
    } catch (error: any) {
      console.error("Failed to create asset:", error);
      setSubmitError(error.message || "Failed to create asset.");
    }
  };

  const handleEditAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    try {
      await updateAsset(editAsset.id, {
        ...editAsset,
        warrantyExpiry: editAsset.warrantyExpiry || undefined
      });
      setEditAsset(null);
      loadAssets();
    } catch (error: any) {
      console.error("Failed to update asset:", error);
      setEditError(error.message || "Failed to update asset.");
    }
  };

  const handleViewAsset = async (asset: any) => {
    setViewAsset(asset);
    setAssetLogs([]);
    setAssetMaintenance([]);
    setAssetDocuments([]);
    setActiveTab('DETAILS');
    try {
      const logs = await fetchAssetLogs(asset.id);
      setAssetLogs(logs);
      const maintenance = await fetchMaintenanceLogs(asset.id);
      setAssetMaintenance(maintenance);
      const docs = await fetchAssetDocuments(asset.id);
      setAssetDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch asset logs", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewAsset) return;
    
    try {
      setUploadingDoc(true);
      await uploadAssetDocument(viewAsset.id, file);
      const docs = await fetchAssetDocuments(viewAsset.id);
      setAssetDocuments(docs);
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploadingDoc(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleCreateRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewAsset) return;
    try {
      await createMaintenanceRecord(viewAsset.id, {
        issueDescription: newRepair.issueDescription,
        cost: newRepair.cost
      });
      setNewRepair({ issueDescription: "", cost: "" });
      const maintenance = await fetchMaintenanceLogs(viewAsset.id);
      setAssetMaintenance(maintenance);
      loadAssets(); // Refresh asset list to show IN_REPAIR status
    } catch (error) {
      console.error("Failed to log repair", error);
    }
  };

  const handleResolveRepair = async (maintenanceId: string, currentAssetId: string) => {
    try {
      await updateMaintenanceRecord(maintenanceId, { status: "COMPLETED", assetId: currentAssetId });
      const maintenance = await fetchMaintenanceLogs(currentAssetId);
      setAssetMaintenance(maintenance);
      loadAssets(); // Refresh asset list to show AVAILABLE status
    } catch (error) {
      console.error("Failed to resolve repair", error);
    }
  };

  const handlePrintQR = () => {
    window.print();
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkOutAssetId || !selectedEmployeeId) return;
    try {
      await checkOutAsset(checkOutAssetId, selectedEmployeeId);
      setCheckOutAssetId(null);
      setIsAddModalOpen(false);
      loadAssets();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to add asset");
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(l => l.trim() !== '');
        if (lines.length <= 1) return;
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const assets = [];
        
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const asset: any = {};
          headers.forEach((h, idx) => {
            if (h === 'asset_tag' || h === 'assettag') asset.assetTag = vals[idx];
            if (h === 'name') asset.name = vals[idx];
            if (h === 'category') asset.category = vals[idx];
            if (h === 'location') asset.location = vals[idx];
            if (h === 'status') asset.status = vals[idx];
          });
          if (asset.name || asset.assetTag) assets.push(asset);
        }

        await importAssetsCSV(assets);
        loadAssets();
        alert(`Successfully imported ${assets.length} assets!`);
      } catch (err) {
        console.error("Import failed:", err);
        alert("Failed to import CSV. Check format.");
      } finally {
        setImporting(false);
        // Reset input
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleCheckIn = async (assetId: string) => {
    try {
      await checkInAsset(assetId);
      loadAssets();
    } catch (error: any) {
      toast.error(error.message || "Failed to check in asset");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "LAPTOP": return <Laptop className="w-5 h-5 text-slate-500" />;
      case "DESKTOP": return <Monitor className="w-5 h-5 text-slate-500" />;
      case "MOBILE": return <Smartphone className="w-5 h-5 text-slate-500" />;
      case "SERVER": return <Server className="w-5 h-5 text-slate-500" />;
      default: return <Monitor className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Available</span>;
      case "ASSIGNED":
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">Assigned</span>;
      case "IN_REPAIR":
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">In Repair</span>;
      case "RETIRED":
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">Retired</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.assetTag?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || asset.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Asset Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all hardware assets across the organization.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleCsvUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={importing}
              title="Upload CSV to Bulk Import"
            />
            <button 
              className={`inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg shadow-sm transition-colors ${importing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 focus:ring-4 focus:ring-slate-100'}`}
            >
              {importing ? (
                <div className="w-4 h-4 mr-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Import CSV
            </button>
          </div>
          <button 
            onClick={downloadAssetsCSV}
            className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          {userRole === 'ADMIN' && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or tag..."
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-auto inline-flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-slate-500" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none inline-flex items-center pl-9 pr-8 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="LAPTOP">Laptops</option>
              <option value="DESKTOP">Desktops</option>
              <option value="MOBILE">Mobile</option>
              <option value="SERVER">Servers</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Asset Name</th>
                <th className="px-6 py-4">Tag / Serial</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                    Loading assets...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No assets found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-slate-900">{asset.name}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{asset.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">{asset.assetTag}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{asset.serialNumber || 'No serial'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(asset.status)}
                    </td>
                    <td className="px-6 py-4">
                      {asset.currentUser ? (
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mr-2">
                            {asset.currentUser.charAt(0)}
                          </div>
                          <span className="text-slate-700">{asset.currentUser}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {asset.location || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {userRole === 'ADMIN' && (
                        <>
                          {asset.status === 'AVAILABLE' && (
                            <button 
                              onClick={() => setCheckOutAssetId(asset.id)}
                              className="text-emerald-600 hover:text-emerald-900 font-medium text-sm cursor-pointer"
                            >
                              Check Out
                            </button>
                          )}
                          {asset.status === 'ASSIGNED' && (
                            <button 
                              onClick={() => handleCheckIn(asset.id)}
                              className="text-orange-600 hover:text-orange-900 font-medium text-sm cursor-pointer"
                            >
                              Check In
                            </button>
                          )}
                          <button 
                            onClick={() => setEditAsset(asset)}
                            className="text-slate-600 hover:text-slate-900 font-medium text-sm cursor-pointer"
                          >
                            Edit
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleViewAsset(asset)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ASSET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50" aria-hidden="true" onClick={() => setIsAddModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">Register New Asset</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-500 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                    {submitError}
                  </div>
                )}
                <form onSubmit={handleAddAsset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Asset Name</label>
                    <input type="text" required value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. MacBook Pro M3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Asset Tag</label>
                    <input type="text" required value={newAsset.assetTag} onChange={e => setNewAsset({...newAsset, assetTag: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. TAG-2024-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Category</label>
                    <select value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="LAPTOP">Laptop</option>
                      <option value="DESKTOP">Desktop</option>
                      <option value="MOBILE">Mobile Device</option>
                      <option value="SERVER">Server</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Location</label>
                    <input type="text" value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. NY Office - 3rd Floor" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Warranty Expiration</label>
                    <input type="date" value={newAsset.warrantyExpiry} onChange={e => setNewAsset({...newAsset, warrantyExpiry: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6 border-t border-slate-100">
                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                      Create Asset
                    </button>
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ASSET MODAL */}
      {viewAsset && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50" aria-hidden="true" onClick={() => { setViewAsset(null); setSearchParams({}); }}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-slate-900">Asset Details</h3>
                  <button onClick={() => { setViewAsset(null); setSearchParams({}); }} className="text-slate-400 hover:text-slate-500 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-6">
                  <button
                    onClick={() => setActiveTab('DETAILS')}
                    className={`pb-3 px-1 mr-6 font-medium text-sm transition-colors border-b-2 ${activeTab === 'DETAILS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                  >
                    Asset Details
                  </button>
                  <button
                    onClick={() => setActiveTab('MAINTENANCE')}
                    className={`pb-3 px-1 mr-6 font-medium text-sm transition-colors border-b-2 ${activeTab === 'MAINTENANCE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                  >
                    Maintenance & Repairs
                  </button>
                  <button
                    onClick={() => setActiveTab('DOCUMENTS')}
                    className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${activeTab === 'DOCUMENTS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                  >
                    Documents
                  </button>
                </div>

                <div className="space-y-4">
                  {activeTab === 'DETAILS' ? (
                    <>
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Column - Details */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-sm font-medium text-slate-500">Name</span>
                            <span className="block text-sm text-slate-900 mt-1">{viewAsset.name}</span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-slate-500">Category</span>
                            <span className="block text-sm text-slate-900 mt-1">{viewAsset.category}</span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-slate-500">Asset Tag</span>
                            <span className="block text-sm text-slate-900 mt-1 font-mono">{viewAsset.assetTag}</span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-slate-500">Serial Number</span>
                            <span className="block text-sm text-slate-900 mt-1 font-mono">{viewAsset.serialNumber || "N/A"}</span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-slate-500">Status</span>
                            <span className="block text-sm text-slate-900 mt-1">{viewAsset.status}</span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-slate-500">Assigned To</span>
                            <span className="block text-sm text-slate-900 mt-1">{viewAsset.currentUser || "Unassigned"}</span>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-slate-500">Location</span>
                            <span className="block text-sm text-slate-900 mt-1">{viewAsset.location || "Unknown"}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-sm font-medium text-slate-500">Warranty Expiration</span>
                            <span className="block text-sm text-slate-900 mt-1">{viewAsset.warrantyExpiry ? new Date(viewAsset.warrantyExpiry).toLocaleDateString() : "No Warranty Logged"}</span>
                          </div>
                        </div>
                        
                        {/* Right Column - QR Code */}
                        <div className="w-full md:w-48 flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-slate-200 print:hidden">
                          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 mb-3">
                            <QRCodeSVG value={viewAsset.id} size={120} />
                          </div>
                          <span className="text-xs text-slate-500 mb-3 text-center">Scan to view details</span>
                          <button 
                            onClick={handlePrintQR}
                            className="flex items-center justify-center w-full px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Label
                          </button>
                        </div>
                        
                        {/* Print-only visible QR layout */}
                        <div className="hidden print:flex flex-col items-center justify-center w-full mt-8 border-t pt-8">
                           <QRCodeSVG value={viewAsset.id} size={200} />
                           <h2 className="mt-4 font-bold text-xl">{viewAsset.name}</h2>
                           <p className="font-mono mt-1 text-slate-600">{viewAsset.assetTag}</p>
                        </div>
                      </div>
                      
                      {/* Activity Logs Section */}
                      <div className="mt-6 border-t border-slate-100 pt-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Activity History</h4>
                        <div className="bg-slate-50 rounded-lg p-4 max-h-60 overflow-y-auto border border-slate-200">
                          {assetLogs.length === 0 ? (
                            <p className="text-sm text-slate-500 italic text-center py-2">No activity recorded for this asset.</p>
                          ) : (
                            <div className="space-y-4">
                              {assetLogs.map(log => (
                                <div key={log.id} className="relative pl-4 border-l-2 border-indigo-200">
                                  <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-1.5"></div>
                                  <p className="text-xs font-semibold text-slate-900">{log.action}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                                    <span>By: {log.performedBy}</span>
                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      {/* Log a New Repair Form (Admin only) */}
                      {userRole === 'ADMIN' && viewAsset.status !== 'IN_REPAIR' && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">Log Maintenance Request</h4>
                          <form onSubmit={handleCreateRepair} className="space-y-3">
                            <div>
                              <input 
                                type="text" 
                                required 
                                placeholder="Describe the issue (e.g. Screen cracked, Battery replacement)"
                                className="w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={newRepair.issueDescription}
                                onChange={e => setNewRepair({...newRepair, issueDescription: e.target.value})}
                              />
                            </div>
                            <div className="flex gap-3">
                              <input 
                                type="number" 
                                placeholder="Estimated Cost (optional)"
                                className="w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={newRepair.cost}
                                onChange={e => setNewRepair({...newRepair, cost: e.target.value})}
                              />
                              <button 
                                type="submit" 
                                className="whitespace-nowrap px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 cursor-pointer"
                              >
                                Submit Request
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                      
                      {/* Ongoing / Past Repairs List */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Maintenance History</h4>
                        {assetMaintenance.length === 0 ? (
                          <p className="text-sm text-slate-500 italic py-2">No maintenance records found.</p>
                        ) : (
                          <div className="space-y-3">
                            {assetMaintenance.map(maint => (
                              <div key={maint.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${maint.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {maint.status}
                                    </span>
                                    <span className="text-xs text-slate-500">{new Date(maint.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-sm text-slate-900 font-medium">{maint.issueDescription}</p>
                                  {maint.cost && <p className="text-xs text-slate-500 mt-1">Cost: ${maint.cost}</p>}
                                </div>
                                {userRole === 'ADMIN' && maint.status !== 'COMPLETED' && (
                                  <button 
                                    onClick={() => handleResolveRepair(maint.id, viewAsset.id)}
                                    className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                                  >
                                    Mark Resolved
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'DOCUMENTS' && (
                    <div className="space-y-6">
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="w-8 h-8 text-indigo-500 mb-3" />
                          <h4 className="font-semibold text-slate-900">Upload Document</h4>
                          <p className="text-xs text-slate-500 mt-1 mb-4">Attach receipts, manuals, or photos</p>
                          
                          <label className="relative cursor-pointer">
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={handleFileUpload} 
                              disabled={uploadingDoc}
                            />
                            <span className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${uploadingDoc ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors`}>
                              {uploadingDoc ? 'Uploading...' : 'Select File'}
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900 text-sm">Attached Documents</h4>
                        {assetDocuments.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">No documents attached yet.</p>
                        ) : (
                          assetDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                              <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded flex items-center justify-center shrink-0">
                                  <Download className="w-4 h-4" />
                                </div>
                                <div className="truncate text-left flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">{doc.filename}</p>
                                  <p className="text-xs text-slate-500">{(doc.size / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <a 
                                href={`http://localhost:8080${doc.filepath}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="ml-4 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                              >
                                View
                              </a>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6 border-t border-slate-100">
                    <button type="button" onClick={() => { setViewAsset(null); setSearchParams({}); }} className="w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm cursor-pointer">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* EDIT ASSET MODAL */}
      {editAsset && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50" aria-hidden="true" onClick={() => setEditAsset(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">Edit Asset</h3>
                  <button onClick={() => setEditAsset(null)} className="text-slate-400 hover:text-slate-500 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {editError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                    {editError}
                  </div>
                )}
                <form onSubmit={handleEditAsset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Asset Name</label>
                    <input type="text" required value={editAsset.name} onChange={e => setEditAsset({...editAsset, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Asset Tag</label>
                    <input type="text" required value={editAsset.assetTag} onChange={e => setEditAsset({...editAsset, assetTag: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Category</label>
                    <select value={editAsset.category} onChange={e => setEditAsset({...editAsset, category: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="LAPTOP">Laptop</option>
                      <option value="DESKTOP">Desktop</option>
                      <option value="MOBILE">Mobile Device</option>
                      <option value="SERVER">Server</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Status</label>
                    <select value={editAsset.status} onChange={e => setEditAsset({...editAsset, status: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="AVAILABLE">Available</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_REPAIR">In Repair</option>
                      <option value="RETIRED">Retired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Location</label>
                    <input type="text" value={editAsset.location} onChange={e => setEditAsset({...editAsset, location: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Warranty Expiry Date</label>
                    <input type="date" value={editAsset.warrantyExpiry ? editAsset.warrantyExpiry.split('T')[0] : ""} onChange={e => setEditAsset({...editAsset, warrantyExpiry: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6 border-t border-slate-100">
                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setEditAsset(null)} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CHECK OUT MODAL */}
      {checkOutAssetId && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50" aria-hidden="true" onClick={() => setCheckOutAssetId(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">Check Out Asset</h3>
                  <button onClick={() => setCheckOutAssetId(null)} className="text-slate-400 hover:text-slate-500 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCheckOut} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Assign to Employee</label>
                    <select required value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="">-- Select Employee --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6 border-t border-slate-100">
                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                      Confirm Check Out
                    </button>
                    <button type="button" onClick={() => setCheckOutAssetId(null)} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
