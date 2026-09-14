import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { ShieldAlert, X, Check, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const NotificationsDrawer: React.FC = () => {
  const { alerts, isNotificationsOpen, toggleNotifications, openTransactionDetails, resolveAlert } = useSystem();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col justify-between animate-fade-in transition-colors duration-300">
      <div>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Security Events</h3>
            <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {alerts.filter(a => !a.isResolved).length} Active
            </span>
          </div>
          <button
            onClick={toggleNotifications}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)] space-y-3">
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8">No security alerts logged.</p>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all duration-200 shadow-xs ${
                  alert.isResolved
                    ? 'bg-slate-100/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                    : alert.severity === 'CRITICAL'
                    ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 hover:border-rose-300 dark:hover:border-rose-700'
                    : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{alert.id}</span>
                  <StatusBadge type="risk" value={alert.severity === 'CRITICAL' ? 'HIGH' : alert.severity} size="sm" />
                </div>
                
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{alert.merchant} (${alert.amount.toFixed(2)})</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{alert.anomalyReason}</p>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{alert.timestamp.split(' ')[1]}</span>
                  <span className="font-medium">{alert.customerName}</span>
                </div>

                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                  <button
                    onClick={() => {
                      openTransactionDetails(alert.transactionId);
                      toggleNotifications();
                    }}
                    className="flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {!alert.isResolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      title="Mark resolved"
                      className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 text-center">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">FedTrust Event Monitoring System</span>
      </div>
    </div>
  );
};
