import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Plus,
  AlertTriangle,
  Brain,
  ArrowRight,
  Loader2,
  Clock
} from 'lucide-react';
import { DashboardMetrics, Incident } from '../types/incident';
import { api } from '../services/api';
import { SeverityBadge, StatusBadge, MemorySourceBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface DashboardPageProps {
  onNavigate: (view: any, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [m, incs] = await Promise.all([api.getMetrics(), api.getIncidents()]);
      setMetrics(m);
      setRecentIncidents(incs.slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Failed to connect to IncidentMind API server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-sky-400 animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-400">Loading IncidentMind Intelligence Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-6 text-center my-8 max-w-xl mx-auto">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-100">Unable to load dashboard</h3>
        <p className="text-xs text-rose-300 mt-1 font-mono">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              Incident Response Intelligence
            </h1>
          </div>
          <p className="text-base text-sky-400 font-medium mt-1">
            Turn previous incidents into faster resolutions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new-incident')}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 via-rose-500 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-xl shadow-rose-950/40 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>+ New Incident</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100">{metrics?.activeIncidents || 0}</span>
            <span className="text-[11px] text-rose-400 font-mono">Requires Attention</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Resolved Incidents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100">{metrics?.resolvedIncidents || 0}</span>
            <span className="text-[11px] text-emerald-400 font-mono">Post-Mortem Saved</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Known Incidents</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100">{metrics?.knownIncidents || 0}</span>
            <span className="text-[11px] text-purple-400 font-mono">In Operational Memory</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Successful Resolutions</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100">{metrics?.successfulResolutions || 0}</span>
            <span className="text-[11px] text-sky-400 font-mono">100% Retained</span>
          </div>
        </Card>
      </div>

      {/* Recent Incidents Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wide">
              Recent Incidents
            </h2>
            <p className="text-xs text-slate-400">
              Live operational triage queue and historical resolution records.
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
          >
            <span>View All Incidents</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {recentIncidents.map((incident) => (
            <div
              key={incident.id}
              onClick={() => onNavigate('analysis', { incidentId: incident.id })}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 px-3 rounded-lg transition-colors cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400">{incident.id}</span>
                  <h3 className="font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                    {incident.title}
                  </h3>
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </div>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                  <span>Service: {incident.service}</span>
                  <span>·</span>
                  <span>Env: {incident.environment}</span>
                  {incident.actualRootCause && (
                    <>
                      <span>·</span>
                      <span className="text-amber-300/80">Root Cause: {incident.actualRootCause}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('analysis', { incidentId: incident.id });
                  }}
                  className="px-3.5 py-1.5 bg-slate-800 group-hover:bg-sky-600 text-slate-200 group-hover:text-white font-semibold text-xs rounded-lg transition-all"
                >
                  Analyze & Triage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
