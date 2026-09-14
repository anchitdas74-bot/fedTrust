import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSystem } from '../../context/SystemContext';
import {
  Sun,
  Moon,
  LogOut,
  Bell,
  Radio,
  Building2,
  User,
  Activity,
  Play,
  Pause
} from 'lucide-react';

export const Header: React.FC = () => {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    mlServiceStatus,
    rfServiceStatus,
    alerts,
    isNotificationsOpen,
    toggleNotifications,
    isRealtimeActive,
    toggleRealtime
  } = useSystem();

  const unreadAlerts = alerts.filter(a => !a.isResolved).length;
  const isSystemHealthy = mlServiceStatus === 'active' && rfServiceStatus === 'active';

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0a0f1d]/85 backdrop-blur-xl px-5 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
      {/* Left section: Institution & Terminal Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-semibold tracking-tight">{session?.institutionName || 'FedTrust Member Bank #01'}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-xs font-mono text-cyan-700 dark:text-cyan-300 shadow-xs">
          <Radio className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
          <span>TERM: {session?.terminalId || 'RF-TERM-8092'}</span>
        </div>
      </div>

      {/* Right section: System Health, Tickers, Theme, Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Realtime Stream Toggle */}
        <button
          onClick={toggleRealtime}
          title={isRealtimeActive ? 'Pause real-time stream' : 'Resume real-time stream'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 shadow-xs ${
            isRealtimeActive
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {isRealtimeActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isRealtimeActive ? 'STREAM LIVE' : 'PAUSED'}</span>
        </button>

        {/* System Health Status */}
        <div
          title={`ML Service: ${mlServiceStatus.toUpperCase()} | RF Sensor: ${rfServiceStatus.toUpperCase()}`}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 shadow-xs"
        >
          <span className={`w-2 h-2 rounded-full ${isSystemHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <Activity className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden md:inline font-mono font-medium text-[11px]">
            {isSystemHealthy ? 'NOMINAL' : 'ATTN REQ'}
          </span>
        </div>

        {/* Notifications Drawer Toggle */}
        <button
          onClick={toggleNotifications}
          title="Security Notifications"
          className={`relative p-2 rounded-xl border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all shadow-xs ${
            isNotificationsOpen ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800' : 'bg-white dark:bg-slate-900/60'
          }`}
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 shadow-xs active:scale-95"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
          )}
        </button>

        {/* User Profile Chip */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
          <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <User className="w-3 h-3" />
          </div>
          <span className="font-mono font-medium text-[11px]">{session?.username || 'analyst'}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign out of FedTrust"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
