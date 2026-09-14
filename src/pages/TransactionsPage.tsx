import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Receipt,
  Search,
  Download,
  ArrowUpRight
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { transactions, openTransactionDetails } = useSystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [rfFilter, setRfFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'riskScore'>('timestamp');

  // Multi-signal filtered list
  const filteredTxns = transactions.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.cardholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.terminalId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || t.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesRf =
      rfFilter === 'ALL' ||
      (rfFilter === 'VERIFIED' && t.isRFVerified) ||
      (rfFilter === 'UNVERIFIED' && !t.isRFVerified);

    return matchesSearch && matchesRisk && matchesStatus && matchesRf;
  });

  // Sort transactions
  const sortedTxns = [...filteredTxns].sort((a, b) => {
    if (sortBy === 'amount') return b.amount - a.amount;
    if (sortBy === 'riskScore') return b.finalRiskScore - a.finalRiskScore;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['TxnID', 'Timestamp', 'Amount', 'Merchant', 'Category', 'Location', 'TerminalID', 'AnomalyScore', 'RFTrust', 'RiskScore', 'Status', 'Action'];
    const rows = sortedTxns.map(t => [
      t.id, t.timestamp, t.amount, `"${t.merchant}"`, `"${t.category}"`, `"${t.location}"`, t.terminalId, t.anomalyScore, t.rfTrustScore, t.finalRiskScore, t.status, t.finalAction
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FedTrust_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 font-mono">
            <Receipt className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>TRANSACTION HISTORY & SEARCH</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Complete audit trail of all real-time and processed transactions across connected bank terminals.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="py-2.5 px-4 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Export CSV Audit Log</span>
        </button>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Txn ID, merchant, cardholder, terminal..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-xs"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <select
            value={rfFilter}
            onChange={e => setRfFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-xs"
          >
            <option value="ALL">All RF Terminals</option>
            <option value="VERIFIED">RF Verified Only</option>
            <option value="UNVERIFIED">RF Unverified Only</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-purple-700 dark:text-purple-300 focus:outline-none focus:border-purple-500 shadow-xs"
          >
            <option value="timestamp">Sort: Newest</option>
            <option value="riskScore">Sort: Risk Score</option>
            <option value="amount">Sort: Amount</option>
          </select>
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-600 dark:text-slate-400 uppercase flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
          <span>Transactions Database ({sortedTxns.length})</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Click any row to open full multi-signal drawer</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-mono border-b border-slate-200 dark:border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-4 font-semibold">Txn ID</th>
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Merchant & Category</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Terminal & RF Trust</th>
                <th className="p-4 font-semibold">ML Anomaly Score</th>
                <th className="p-4 font-semibold">Final Score</th>
                <th className="p-4 font-semibold">Status & Action</th>
                <th className="p-4 text-right font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
              {sortedTxns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                sortedTxns.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => openTransactionDetails(t.id)}
                    className="hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-mono font-bold text-cyan-700 dark:text-cyan-400">{t.id}</td>
                    <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{t.timestamp}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-slate-200">{t.merchant}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.category} • {t.location}</div>
                    </td>
                    <td className="p-4 font-mono font-extrabold text-slate-900 dark:text-white">${t.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="font-mono text-cyan-800 dark:text-cyan-300 font-medium">{t.terminalId}</div>
                      <StatusBadge type="rf" value={t.isRFVerified ? 'VERIFIED' : 'UNVERIFIED'} size="sm" />
                    </td>
                    <td className="p-4 font-mono text-purple-700 dark:text-purple-400 font-bold">{t.anomalyScore}%</td>
                    <td className="p-4">
                      <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                        {t.finalRiskScore}/100
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge type="status" value={t.status} size="sm" />
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
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
