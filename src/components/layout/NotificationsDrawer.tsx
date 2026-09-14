import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { ShieldAlert, X, Check, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const NotificationsDrawer: React.FC = () => {
  const { alerts, isNotificationsOpen, toggleNotifications, openTransactionDetails, resolveAlert } = useSystem();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 dark:bg-slate-900/95 backdrop-blur-2xl border-l border-gray-800 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300">
      <div>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-sm text-gray-100">Security Events</h3>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-rose-500/20 text-rose-400">
              {alerts.filter(a => !a.isResolved).length} Active
            </span>
          </div>
          <button
            onClick={toggleNotifications}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)] space-y-3">
          {alerts.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">No security alerts logged.</p>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  alert.isResolved
                    ? 'bg-gray-800/30 border-gray-800 opacity-60'
                    : alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/30 border-rose-800/50 hover:border-rose-700'
                    : 'bg-amber-950/20 border-amber-800/40 hover:border-amber-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{alert.id}</span>
                  <StatusBadge type="risk" value={alert.severity === 'CRITICAL' ? 'HIGH' : alert.severity} size="sm" />
                </div>
                
                <h4 className="text-xs font-semibold text-gray-200">{alert.merchant} (${alert.amount.toFixed(2)})</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{alert.anomalyReason}</p>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{alert.timestamp.split(' ')[1]}</span>
                  <span>{alert.customerName}</span>
                </div>

                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-800/60">
                  <button
                    onClick={() => {
                      openTransactionDetails(alert.transactionId);
                      toggleNotifications();
                    }}
                    className="flex-1 py-1 px-2.5 rounded text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {!alert.isResolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      title="Mark resolved"
                      className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
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

      <div className="p-3 border-t border-gray-800 text-center">
        <span className="text-[11px] text-gray-400">FedTrust Event Monitoring System</span>
      </div>
    </div>
  );
};
