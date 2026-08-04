// src/components/Dashboard.jsx
// ============================================================
// IT Asset Tracker — Main Dashboard
// Single-page component; all child UI is composed inline for
// portability. Split into sub-components as the app grows.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboardMetrics,
  fetchAssets,
  createAsset,
  assignAsset,
  updateAssetStatus,
} from '../api/assetApi';

// ── Utility helpers ──────────────────────────────────────────

const STATUS_META = {
  AVAILABLE: { label: 'Available',  bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  ASSIGNED:  { label: 'Assigned',   bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  IN_REPAIR: { label: 'In Repair',  bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  RETIRED:   { label: 'Retired',    bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400'   },
};

const CATEGORIES = [
  'LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER',
  'EMBEDDED_SYSTEM', 'IOT_SENSOR', 'NETWORK_DEVICE',
  'MOBILE_DEVICE', 'SERVER', 'OTHER',
];

function fmtCategory(cat) {
  return cat.replace(/_/g, ' ');
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.RETIRED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

// ── Metric Card ──────────────────────────────────────────────

function MetricCard({ title, value, icon, accent }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-slate-800 leading-tight">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── Modal wrapper ────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            aria-label="Close"
          >×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Assign Asset Modal ───────────────────────────────────────

function AssignModal({ asset, onClose, onSuccess }) {
  const [userName, setUserName]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit() {
    if (!userName.trim()) { setError('User name is required'); return; }
    setLoading(true); setError('');
    try {
      await assignAsset(asset.id, userName.trim());
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={`Assign "${asset.name}"`} onClose={onClose}>
      <p className="text-sm text-slate-500 mb-4">
        Asset tag: <span className="font-mono font-medium text-slate-700">{asset.assetTag}</span>
      </p>
      <label className="block text-sm font-medium text-slate-700 mb-1">Assign to</label>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Full name or employee ID"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        autoFocus
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="flex gap-3 mt-5 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Assigning…' : 'Confirm Assignment'}
        </button>
      </div>
    </Modal>
  );
}

// ── Add Asset Modal ──────────────────────────────────────────

function AddAssetModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    assetTag: '', name: '', category: 'LAPTOP',
    serialNumber: '', location: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.assetTag.trim() || !form.name.trim()) {
      setError('Asset tag and name are required');
      return;
    }
    setLoading(true); setError('');
    try {
      await createAsset(form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const Field = ({ label, field, placeholder, type = 'text' }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={(e) => setField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );

  return (
    <Modal title="Add New Asset" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Asset Tag *" field="assetTag" placeholder="ASSET-009" />
        <Field label="Asset Name *" field="name" placeholder="Dell XPS 15 Laptop" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{fmtCategory(c)}</option>
            ))}
          </select>
        </div>
        <Field label="Serial Number" field="serialNumber" placeholder="SN-XYZ-001" />
        <Field label="Location" field="location" placeholder="IT Storeroom" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>
      </div>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <div className="flex gap-3 mt-5 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Add Asset'}
        </button>
      </div>
    </Modal>
  );
}

// ── Status Action Menu ───────────────────────────────────────

function StatusMenu({ asset, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [notes, setNotes]     = useState('');

  async function handleStatusChange(newStatus) {
    setLoading(true); setError('');
    try {
      await updateAssetStatus(asset.id, newStatus, notes);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const current = asset.status;

  return (
    <Modal title={`Update Status — ${asset.name}`} onClose={onClose}>
      <p className="text-sm text-slate-500 mb-3">
        Current: <StatusBadge status={current} />
      </p>
      <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. Screen cracked, sent for repair"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      <div className="flex flex-col gap-2">
        {current !== 'AVAILABLE' && (
          <button
            onClick={() => handleStatusChange('AVAILABLE')}
            disabled={loading}
            className="w-full py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 disabled:opacity-50"
          >
            ✓ Mark as Available
          </button>
        )}
        {current !== 'IN_REPAIR' && (
          <button
            onClick={() => handleStatusChange('IN_REPAIR')}
            disabled={loading}
            className="w-full py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 disabled:opacity-50"
          >
            🔧 Send to Repair
          </button>
        )}
        {current !== 'RETIRED' && (
          <button
            onClick={() => handleStatusChange('RETIRED')}
            disabled={loading}
            className="w-full py-2.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
          >
            🗄 Retire Asset
          </button>
        )}
      </div>
    </Modal>
  );
}

// ── Main Dashboard ───────────────────────────────────────────

export default function Dashboard() {
  const [metrics, setMetrics]         = useState(null);
  const [assets, setAssets]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [assignTarget, setAssignTarget]   = useState(null); // asset to assign
  const [statusTarget, setStatusTarget]   = useState(null); // asset for status change
  const [showAddModal, setShowAddModal]   = useState(false);

  // ── Data loading ──

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [m, a] = await Promise.all([
        fetchDashboardMetrics(),
        fetchAssets(),
      ]);
      setMetrics(m);
      setAssets(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Derived / filtered list ──

  const visible = assets.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      (a.currentUser || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Render ──

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg">
              🖥
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">IT Asset Tracker</h1>
              <p className="text-xs text-slate-400">Inventory & Assignment Management</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <span className="text-base leading-none">＋</span> Add Asset
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Global error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-red-500 text-lg">⚠</span>
            <div>
              <p className="text-sm font-semibold text-red-700">Failed to load data</p>
              <p className="text-xs text-red-500">{error}</p>
            </div>
            <button
              onClick={loadAll}
              className="ml-auto text-xs text-red-600 underline hover:no-underline"
            >Retry</button>
          </div>
        )}

        {/* ── Metrics row ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Live Overview
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Assets" value={metrics?.TOTAL}     icon="📦" accent="bg-indigo-50" />
              <MetricCard title="Available"    value={metrics?.AVAILABLE}  icon="✅" accent="bg-emerald-50" />
              <MetricCard title="In Repair"    value={metrics?.IN_REPAIR}  icon="🔧" accent="bg-amber-50" />
              <MetricCard title="Assigned"     value={metrics?.ASSIGNED}   icon="👤" accent="bg-blue-50" />
            </div>
          )}
        </section>

        {/* ── Asset Inventory ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Asset Inventory
              {!loading && (
                <span className="ml-2 text-indigo-600 font-bold text-sm normal-case">
                  {visible.length} / {assets.length}
                </span>
              )}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_META).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {/* Search */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets or users…"
                className="border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-52"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-slate-500 font-medium">No assets found</p>
                <p className="text-slate-400 text-sm mt-1">
                  {search || filterStatus ? 'Try adjusting your filters' : 'Add your first asset to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Asset</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Current User</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Location</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {visible.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{asset.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{asset.assetTag}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                            {fmtCategory(asset.category)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={asset.status} />
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {asset.currentUser || <span className="text-slate-300 italic">Unassigned</span>}
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs">
                          {asset.location || '—'}
                        </td>
                        <td className="px-5 py-4">
                          {/* Action buttons — visible on row hover */}
                          <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            {asset.status === 'AVAILABLE' && (
                              <button
                                onClick={() => setAssignTarget(asset)}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
                              >
                                Assign
                              </button>
                            )}
                            <button
                              onClick={() => setStatusTarget(asset)}
                              className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50"
                            >
                              Status
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Modals ── */}
      {assignTarget && (
        <AssignModal
          asset={assignTarget}
          onClose={() => setAssignTarget(null)}
          onSuccess={loadAll}
        />
      )}
      {statusTarget && (
        <StatusMenu
          asset={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={loadAll}
        />
      )}
      {showAddModal && (
        <AddAssetModal
          onClose={() => setShowAddModal(false)}
          onSuccess={loadAll}
        />
      )}
    </div>
  );
}
