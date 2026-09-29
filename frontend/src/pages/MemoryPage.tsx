import React, { useEffect, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  History,
  Loader2,
  Sparkles,
  Search,
  Activity,
  Layers
} from 'lucide-react';
import { MemoryItem, MemoryOverview } from '../types/incident';
import { api } from '../services/api';
import { MemorySourceBadge, SeverityBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const MemoryPage: React.FC = () => {
  const [overview, setOverview] = useState<MemoryOverview | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemoryData();
  }, []);

  const loadMemoryData = async () => {
    try {
      setLoading(true);
      const [ov, mems] = await Promise.all([api.getMemoryOverview(), api.getMemoryItems()]);
      setOverview(ov);
      setMemories(mems);
    } catch (err) {
      console.error('Failed to load memory data', err);
    } finally {
      setLoading(false);
    }
  };

  const timelineSteps = [
    {
      step: '01',
      title: 'Incident Occurred',
      desc: 'Telemetry alarms trigger & symptoms recorded',
      icon: Activity,
      color: 'border-rose-500/40 text-rose-400 bg-rose-950/20'
    },
    {
      step: '02',
      title: 'Investigation',
      desc: 'AI recalls past incidents & matches runbooks',
      icon: Search,
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20'
    },
    {
      step: '03',
      title: 'Root Cause Identified',
      desc: 'SRE verifies hypothesis & pinpoints root cause',
      icon: Sparkles,
      color: 'border-amber-500/40 text-amber-400 bg-amber-950/20'
    },
    {
      step: '04',
      title: 'Resolution Applied',
      desc: 'Approved mitigation runbook executed',
      icon: CheckCircle2,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
    },
    {
      step: '05',
      title: 'Post-Mortem',
      desc: 'Captured what worked, what failed & resolution time',
      icon: Layers,
      color: 'border-purple-500/40 text-purple-400 bg-purple-950/20'
    },
    {
      step: '06',
      title: 'Experience Remembered',
      desc: 'Ingested into Hindsight Memory for future incidents',
      icon: Brain,
      color: 'border-sky-500/50 text-sky-300 bg-sky-950/30 shadow-lg shadow-sky-950/40'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin mr-3" />
        <span className="text-xs font-mono text-slate-400">Loading Operational Memory Base...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Operational Memory Base
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persistent knowledge repository storing root causes, resolutions, and runbook efficacy.
          </p>
        </div>
        <MemorySourceBadge source={overview?.memorySource || 'Hindsight Memory'} />
      </div>

      {/* Memory Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            Known Incidents
          </span>
          <span className="text-2xl font-extrabold text-slate-100">
            {overview?.totalKnownIncidents || 0}
          </span>
        </Card>

        <Card>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            Unique Root Causes
          </span>
          <span className="text-2xl font-extrabold text-amber-400">
            {overview?.uniqueRootCauses || 0}
          </span>
        </Card>

        <Card>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            Resolutions
          </span>
          <span className="text-2xl font-extrabold text-emerald-400">
            {overview?.successfulResolutions || 0}
          </span>
        </Card>

        <Card>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            Runbooks
          </span>
          <span className="text-2xl font-extrabold text-sky-400">
            {overview?.activeRunbooks || 4}
          </span>
        </Card>

        <Card>
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            Recent Learnings
          </span>
          <span className="text-2xl font-extrabold text-purple-400">
            {overview?.recentLearningsCount || 0}
          </span>
        </Card>
      </div>

      {/* Incident Learning Timeline (Visual Flow) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              Incident Learning Timeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hindsight Cloud Memory Lifecycle: Recall → Retain → Reflect.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
            Live Hindsight Integration Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
          {timelineSteps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className={`border rounded-xl p-4 flex flex-col justify-between ${st.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold">{st.step}</span>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 mb-1">{st.title}</h4>
                  <p className="text-[11px] font-mono opacity-80 leading-tight">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stored Memory Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            Retained Operational Experiences
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Total {memories.length} Memories Stored
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-sky-500/40 transition-all shadow-md space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={mem.severity} />
                  <h3 className="font-bold text-slate-100 text-sm">{mem.title}</h3>
                </div>
                <MemorySourceBadge source={mem.source} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">Service</span>
                  <span className="text-slate-300">{mem.service}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">Date</span>
                  <span className="text-slate-300">{mem.date}</span>
                </div>
              </div>

              <div className="text-xs font-mono">
                <span className="text-slate-400 uppercase text-[10px] block mb-1">
                  Root Cause
                </span>
                <p className="text-amber-300/90 bg-slate-950 p-2.5 rounded border border-amber-900/30">
                  {mem.rootCause}
                </p>
              </div>

              <div className="text-xs font-mono">
                <span className="text-slate-400 uppercase text-[10px] block mb-1">
                  Resolution Applied
                </span>
                <p className="text-emerald-300/90 bg-slate-950 p-2.5 rounded border border-emerald-900/30">
                  {mem.resolution}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Outcome: {mem.outcome}</span>
                {mem.resolutionTimeMinutes && (
                  <span className="text-emerald-400">
                    Resolved in {mem.resolutionTimeMinutes}m
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
