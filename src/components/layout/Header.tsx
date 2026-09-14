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
    <header className="h-16 border-b border-gray-800/80 dark:border-gray-800/80 bg-gray-950/60 dark:bg-slate-950/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left section: Institution & Terminal Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold">{session?.institutionName || 'FedTrust Member Institution #01'}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800/60 dark:bg-gray-800/60 border border-gray-700/50 text-xs font-mono text-cyan-300">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>TERM: {session?.terminalId || 'RF-TERM-8092'}</span>
        </div>
      </div>

      {/* Right section: System Health, Tickers, Theme, Logout */}
      <div className="flex items-center gap-3">
        {/* Realtime Stream Toggle */}
        <button
          onClick={toggleRealtime}
          title={isRealtimeActive ? 'Pause real-time stream' : 'Resume real-time stream'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
            isRealtimeActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200'
          }`}
        >
          {isRealtimeActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRealtimeActive ? 'STREAM LIVE' : 'PAUSED'}</span>
        </button>

        {/* System Health Dot */}
        <div
          title={`ML: ${mlServiceStatus.toUpperCase()} | RF: ${rfServiceStatus.toUpperCase()}`}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-800/50 dark:bg-gray-800/50 border border-gray-700/50 text-xs text-gray-300"
        >
          <span className={`w-2 h-2 rounded-full ${isSystemHealthy ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
          <Activity className="w-3.5 h-3.5 text-gray-400" />
          <span className="hidden md:inline font-mono">{isSystemHealthy ? 'SYSTEM NOMINAL' : 'ATTENTION REQ'}</span>
        </div>

        {/* Notifications Drawer Toggle */}
        <button
          onClick={toggleNotifications}
          className={`relative p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-colors ${
            isNotificationsOpen ? 'bg-gray-800 text-cyan-400' : ''
          }`}
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Logged in User Profile */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800/40 border border-gray-700/40 text-xs text-gray-300">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono">{session?.username || 'sec_officer'}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign out of FedTrust"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
