import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Receipt,
  Radio,
  Network,
  BrainCircuit,
  Bell,
  Sliders,
  PlaySquare,
  Lock,
  Sparkles
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const Sidebar: React.FC = () => {
  const { alerts } = useSystem();
  const activeAlertsCount = alerts.filter(a => !a.isResolved).length;

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: Receipt },
    { path: '/rf-auth', label: 'RF Authentication', icon: Radio },
    { path: '/federated-net', label: 'Federated Network', icon: Network },
    { path: '/ai-explainability', label: 'AI Explainability', icon: BrainCircuit },
    { path: '/alerts', label: 'Alerts Center', icon: Bell, badge: activeAlertsCount },
    { path: '/simulator', label: 'Live Demo Simulator', icon: PlaySquare, highlight: true },
    { path: '/settings', label: 'Settings', icon: Sliders }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0a0f1d]/85 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0 z-30 select-none transition-colors duration-300">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-wider brand-text-gradient font-mono">FedTrust</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Fraud Intelligence Portal</p>
          </div>
        </div>

        {/* Security Scope Tag */}
        <div className="mx-4 my-3 p-2.5 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 flex items-center gap-2 shadow-xs transition-colors">
          <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Lock className="w-3.5 h-3.5 shrink-0" />
          </div>
          <span className="text-[11px] font-semibold text-cyan-900 dark:text-cyan-200">
            Physical RF + ML Active
          </span>
          <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400 ml-auto animate-pulse" />
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-semibold'
                        : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-purple-300/40 dark:border-purple-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Telemetry Specs */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1.5 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium">ML Core Engine:</span>
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold text-[11px]">PyTorch v2.4</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium">RF Hardware S11:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">2.45 GHz</span>
        </div>
        <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 tracking-wide text-center">
          © 2026 FedTrust FinTech Security
        </p>
      </div>
    </aside>
  );
};
