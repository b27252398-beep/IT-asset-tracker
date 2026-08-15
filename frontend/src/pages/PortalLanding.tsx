import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Wrench, ArrowRight, Monitor, Zap } from 'lucide-react';

const portals = [
  {
    id: 'admin',
    title: 'Admin Portal',
    subtitle: 'IT Administrator',
    description: 'Full system control — manage assets, employees, approvals, vendors, and all IT operations.',
    icon: Shield,
    href: '/login/admin',
    gradient: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,0.35)',
    border: 'rgba(99,102,241,0.5)',
    badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    btn: 'bg-indigo-600 hover:bg-indigo-500',
    features: ['Full asset management', 'Approval authority', 'Audit logs & reports', 'User management'],
  },
  {
    id: 'staff',
    title: 'Staff Portal',
    subtitle: 'Employee / Staff',
    description: 'Submit helpdesk tickets, track your asset requests, and scan QR codes for quick lookups.',
    icon: Users,
    href: '/login/staff',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.35)',
    border: 'rgba(59,130,246,0.5)',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    btn: 'bg-blue-600 hover:bg-blue-500',
    features: ['Submit issue tickets', 'Track request status', 'QR code scanner', 'Personal settings'],
  },
  {
    id: 'tech',
    title: 'Tech Team Portal',
    subtitle: 'Technical Support',
    description: 'View assigned tickets, manage asset repairs, and update resolution status for all open issues.',
    icon: Wrench,
    href: '/login/tech',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.35)',
    border: 'rgba(16,185,129,0.5)',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    btn: 'bg-emerald-600 hover:bg-emerald-500',
    features: ['Assigned ticket queue', 'Asset repair tracking', 'Resolution notes', 'Status updates'],
  },
];

export default function PortalLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050B1F] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          width: '100%', height: '100%',
        }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '50%', right: '30%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">ITAMS Core</span>
            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-medium">Enterprise</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400 font-medium">v2.0 · Acme Technologies Inc.</span>
        </div>
      </header>

      {/* Hero */}
      <div className="relative z-10 text-center pt-16 pb-12 px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          IT Asset Management System
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-none mb-4">
          Select Your <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Portal</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Choose the portal that matches your role to access your personalized workspace.
        </p>
      </div>

      {/* Portal Cards */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                onClick={() => navigate(portal.href)}
                className="group relative cursor-pointer rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${portal.border}`,
                  boxShadow: `0 0 0 0 ${portal.glow}`,
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px 8px ${portal.glow}, 0 20px 60px rgba(0,0,0,0.3)`;
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${portal.glow}`;
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <div>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${portal.badge}`}>
                    {portal.subtitle}
                  </span>
                  <h2 className="text-xl font-bold text-white">{portal.title}</h2>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">{portal.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-1.5">
                  {portal.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${portal.gradient} flex-shrink-0`} style={{ width: 6, height: 6 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className={`mt-auto w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-sm font-semibold transition-all ${portal.btn} group-hover:shadow-lg`}>
                  Enter Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-8 text-xs text-slate-600 dark:text-slate-300">
        © 2025 Acme Technologies Inc. · ITAMS Core v2.0 · All rights reserved.
      </div>
    </div>
  );
}
