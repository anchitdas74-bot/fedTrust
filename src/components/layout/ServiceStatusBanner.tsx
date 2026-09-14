import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { AlertOctagon, Radio, Cpu, ServerOff } from 'lucide-react';

export const ServiceStatusBanner: React.FC = () => {
  const { mlServiceStatus, rfServiceStatus, backendConnection } = useSystem();

  const isMlUnavailable = mlServiceStatus === 'unavailable';
  const isRfUnavailable = rfServiceStatus === 'unavailable';
  const isBackendOffline = backendConnection === 'offline';

  if (!isMlUnavailable && !isRfUnavailable && !isBackendOffline) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 dark:from-amber-950/90 dark:via-rose-950/90 dark:to-amber-950/90 border-b border-amber-400/40 dark:border-amber-500/30 px-6 py-2 text-xs font-medium text-amber-900 dark:text-amber-200 flex items-center justify-between z-10 transition-colors">
      <div className="flex items-center gap-3 flex-wrap">
        <AlertOctagon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />
        <span className="font-bold text-amber-900 dark:text-amber-300">SYSTEM DEGRADATION WARNING:</span>
        
        {isMlUnavailable && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-400/40 font-mono text-[11px]">
            <Cpu className="w-3 h-3" /> ML Service Unavailable
          </span>
        )}

        {isRfUnavailable && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-400/40 font-mono text-[11px]">
            <Radio className="w-3 h-3" /> RF Terminal Data Unavailable
          </span>
        )}

        {isBackendOffline && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/40 font-mono text-[11px]">
            <ServerOff className="w-3 h-3" /> FastAPI Backend Offline (Autonomous Mock Mode Active)
          </span>
        )}
      </div>

      <span className="text-[11px] text-amber-700 dark:text-amber-400/80 hidden md:inline font-medium">
        Security decisions rely on available redundant signals. Technical outages are never spoofed as fraud.
      </span>
    </div>
  );
};
