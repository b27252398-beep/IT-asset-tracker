import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Eye, EyeOff, Monitor, Lock, User } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function LoginAdmin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
      const { token, user } = res.data.data;
      login(token, user);
      navigate('/');
    } catch {
      setError('Invalid credentials. Try: admin / admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)' }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white dark:bg-slate-900/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">ITAMS Core</span>
        </div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-white dark:bg-slate-900/10 rounded-3xl flex items-center justify-center backdrop-blur-sm mb-8 border border-white/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            IT Admin<br />Control Center
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-xs">
            Full access to manage assets, employees, approvals, vendors, and all IT operations across the organization.
          </p>

          <div className="mt-10 space-y-3">
            {['Manage 18+ IT assets', 'Approve & reject requests', 'Full audit trail access', 'Vendor & PO management'].map(f => (
              <div key={f} className="flex items-center gap-3 text-indigo-200 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-indigo-300 text-xs">© 2025 Acme Technologies Inc.</p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="w-full max-w-md">

          <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:text-indigo-400 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Portal Selection
          </Link>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Portal</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">IT Administrator Access</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 dark:bg-slate-900/50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 dark:bg-slate-900/50" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30">
                <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold">Demo credentials</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">Username: <strong>admin</strong> · Password: <strong>admin123</strong></p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 text-sm shadow-lg shadow-indigo-500/25">
                {loading ? 'Signing in…' : 'Sign in to Admin Portal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
