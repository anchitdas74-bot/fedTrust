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
  Lock
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
    <aside className="w-64 border-r border-gray-800/80 dark:border-gray-800/80 bg-gray-950/70 dark:bg-slate-950/70 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-gray-900 dark:text-white font-mono">FedTrust</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-gray-400">Fraud Intelligence Portal</p>
          </div>
        </div>

        {/* Security Scope Tag */}
        <div className="mx-4 my-3 p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[11px] font-medium text-cyan-300">
            Physical RF + ML Engine Active
          </span>
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
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 font-semibold'
                        : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                      : item.highlight
                      ? 'text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 border border-purple-500/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-800/80 text-xs text-gray-400 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>ML Core Engine:</span>
          <span className="font-mono text-cyan-400 font-semibold">PyTorch v2.4</span>
        </div>
        <div className="flex items-center justify-between">
          <span>RF Hardware S11:</span>
          <span className="font-mono text-emerald-400 font-semibold">2.45 GHz</span>
        </div>
        <p className="mt-2 text-[10px] text-gray-400 tracking-wide text-center">
          © 2026 FedTrust FinTech Security
        </p>
      </div>
    </aside>
  );
};
