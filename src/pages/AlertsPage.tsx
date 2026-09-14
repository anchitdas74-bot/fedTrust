import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ShieldAlert,
  Search,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AlertsPage: React.FC = () => {
  const { alerts, openTransactionDetails } = useSystem();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.terminalId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5 font-mono">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>SECURITY EVENT CENTER & ALERTS</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Centralized security incident logging and real-time suspicious transaction notifications.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search alert, merchant, terminal..."
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 w-60"
            />
          </div>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 font-mono text-xs font-bold text-gray-400 uppercase flex justify-between items-center">
          <span>Security Events ({filteredAlerts.length})</span>
          <span className="text-[11px] text-gray-400 font-normal">Click any alert to inspect transaction breakdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 text-gray-400 font-mono border-b border-gray-800 uppercase text-[10px]">
              <tr>
                <th className="p-4">Alert ID</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Merchant & Amount</th>
                <th className="p-4">Terminal & RF Status</th>
                <th className="p-4">ML Anomaly Reason</th>
                <th className="p-4">Final Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    No security alerts found matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(alert => (
                  <tr
                    key={alert.id}
                    className={`hover:bg-gray-800/40 transition-colors ${
                      alert.isResolved ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-4 font-mono font-bold text-cyan-400">{alert.id}</td>
                    <td className="p-4">
                      <StatusBadge type="risk" value={alert.severity === 'CRITICAL' ? 'HIGH' : alert.severity} size="sm" />
                    </td>
                    <td className="p-4 font-mono text-gray-400">{alert.timestamp}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-200">{alert.merchant}</div>
                      <div className="font-mono text-gray-400">${alert.amount.toFixed(2)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-cyan-300">{alert.terminalId}</div>
                      <StatusBadge type="rf" value={alert.rfTrustResult} size="sm" />
                    </td>
                    <td className="p-4 text-gray-300 max-w-xs leading-relaxed">
                      {alert.anomalyReason}
                    </td>
                    <td className="p-4 font-mono font-bold text-rose-400">
                      {alert.finalRiskScore}/100
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openTransactionDetails(alert.transactionId)}
                        className="py-1.5 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => navigate('/ai-explainability')}
                        title="View SHAP"
                        className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 inline-flex items-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
