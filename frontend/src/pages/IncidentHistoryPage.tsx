import React, { useEffect, useState } from 'react';
import { Search, Filter, History, Loader2, Clock, ArrowRight } from 'lucide-react';
import { Incident } from '../types/incident';
import { api } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/ui/Badge';

interface IncidentHistoryPageProps {
  onNavigate: (view: any, params?: any) => void;
}

export const IncidentHistoryPage: React.FC<IncidentHistoryPageProps> = ({ onNavigate }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadHistory();
  }, [search, serviceFilter, severityFilter, statusFilter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents({
        search: search || undefined,
        service: serviceFilter !== 'All' ? serviceFilter : undefined,
        severity: severityFilter !== 'All' ? severityFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined
      });
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incident history', err);
    } finally {
      setLoading(false);
    }
  };

  const services = ['All', 'Payment API', 'Order API', 'Authentication Service', 'Web Application', 'Notification Service'];
  const severities = ['All', 'SEV-1', 'SEV-2', 'SEV-3', 'SEV-4'];
  const statuses = ['All', 'Active', 'Investigating', 'Resolved'];

  return (
    <div className="space-y-6">
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Incident History Log
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete operational record of past system outages, triage notes, and post-mortems.
          </p>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symptoms, root causes..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        {/* Service Filter */}
        <div>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
          >
            {services.map((s) => (
              <option key={s} value={s}>
                Service: {s}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
          >
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                Severity: {sev}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 text-xs font-mono">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-purple-400" />
            <span>Fetching operational history...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            No incidents matched the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Incident ID</th>
                  <th className="py-3.5 px-4 font-bold">Incident Title</th>
                  <th className="py-3.5 px-4 font-bold">Service</th>
                  <th className="py-3.5 px-4 font-bold">Severity</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Root Cause</th>
                  <th className="py-3.5 px-4 font-bold">Resolution Time</th>
                  <th className="py-3.5 px-4 font-bold">Date</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onNavigate('analysis', { incidentId: inc.id })}
                    className="hover:bg-slate-850/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-300">{inc.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100 group-hover:text-purple-400 transition-colors">
                      {inc.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{inc.service}</td>
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-amber-300/80 max-w-xs truncate">
                      {inc.actualRootCause || 'Under investigation'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {inc.resolutionTimeMinutes ? `${inc.resolutionTimeMinutes}m` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {inc.createdAt.split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('analysis', { incidentId: inc.id });
                        }}
                        className="text-purple-400 hover:text-purple-300 font-bold inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
