import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, ArrowLeft, Eye, EyeOff, Monitor, Lock, User, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function LoginTech() {
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
      setError('Invalid credentials. Try: tech / tech123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">ITAMS Core</span>
        </div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm mb-8 border border-white/20">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Technical<br />Support Hub
          </h2>
          <p className="text-emerald-200 text-lg leading-relaxed max-w-xs">
            View your assigned tickets, work through issues, and mark them resolved — all in one place.
          </p>

          <div className="mt-10 space-y-3">
            {['Assigned ticket queue', 'Asset details & history', 'Mark In Progress / Resolved', 'Add resolution notes'].map(f => (
              <div key={f} className="flex items-center gap-3 text-emerald-200 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-200" />
              <span className="text-white text-sm font-semibold">Your Workflow</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">Assigned</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">In Progress</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">Resolved</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-emerald-300 text-xs">© 2025 Acme Technologies Inc.</p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">

          <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Portal Selection
          </Link>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Tech Team Portal</h1>
                <p className="text-xs text-slate-500">Technical Support Access</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="tech"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-emerald-700 font-semibold">Demo credentials</p>
                <p className="text-xs text-emerald-600 mt-0.5">Username: <strong>tech</strong> · Password: <strong>tech123</strong></p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 text-sm shadow-lg shadow-emerald-500/25">
                {loading ? 'Signing in…' : 'Sign in to Tech Portal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
