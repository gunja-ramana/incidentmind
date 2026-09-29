import React from 'react';
import {
  AlertTriangle,
  History,
  Search,
  CheckCircle2,
  Zap,
  ArrowRight,
  Brain,
  Sparkles
} from 'lucide-react';
import { Incident, SimilarIncidentMatch } from '../../types/incident';

interface IncidentMemoryTrailProps {
  currentIncident: Incident;
  topSimilarMatch?: SimilarIncidentMatch;
  isResolved?: boolean;
  actualRootCause?: string;
  resolutionSteps?: string;
  memorySource?: 'Demo Memory' | 'Hindsight Memory';
}

export const IncidentMemoryTrail: React.FC<IncidentMemoryTrailProps> = ({
  currentIncident,
  topSimilarMatch,
  isResolved = false,
  actualRootCause,
  resolutionSteps,
  memorySource = 'Demo Memory'
}) => {
  const steps = [
    {
      step: 1,
      label: 'CURRENT INCIDENT',
      icon: AlertTriangle,
      color: 'border-rose-500/50 bg-rose-500/10 text-rose-300',
      iconColor: 'text-rose-400',
      title: currentIncident.title,
      subtitle: `${currentIncident.service} · ${currentIncident.severity}`
    },
    {
      step: 2,
      label: 'SIMILAR HISTORICAL INCIDENT',
      icon: History,
      color: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
      iconColor: 'text-purple-400',
      title: topSimilarMatch ? topSimilarMatch.incident.title : 'No Direct Match',
      subtitle: topSimilarMatch
        ? `Strong historical match (${topSimilarMatch.incident.date})`
        : 'Searching historical records...'
    },
    {
      step: 3,
      label: 'PREVIOUS ROOT CAUSE',
      icon: Search,
      color: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
      iconColor: 'text-amber-400',
      title: topSimilarMatch ? topSimilarMatch.incident.rootCause : 'Awaiting baseline',
      subtitle: topSimilarMatch ? `Source: ${memorySource}` : 'Standard diagnostic pool'
    },
    {
      step: 4,
      label: 'PREVIOUS RESOLUTION',
      icon: CheckCircle2,
      color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
      iconColor: 'text-emerald-400',
      title: topSimilarMatch ? topSimilarMatch.incident.resolution : 'Standard triage',
      subtitle: topSimilarMatch ? `Resolved in ${topSimilarMatch.incident.resolutionTimeMinutes} mins` : 'N/A'
    },
    {
      step: 5,
      label: 'RECOMMENDED ACTION',
      icon: Zap,
      color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300',
      iconColor: 'text-cyan-400',
      title: topSimilarMatch
        ? `Investigate ${topSimilarMatch.incident.rootCause.toLowerCase()} first`
        : 'Follow standard triage runbook',
      subtitle: 'Derived from operational memory'
    },
    {
      step: 6,
      label: 'CURRENT RESOLUTION',
      icon: CheckCircle2,
      color: isResolved
        ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200'
        : 'border-slate-700 bg-slate-800/40 text-slate-400',
      iconColor: isResolved ? 'text-emerald-400' : 'text-slate-500',
      title: isResolved && resolutionSteps ? resolutionSteps : 'Pending Incident Resolution',
      subtitle: isResolved ? `Root cause: ${actualRootCause || 'Identified'}` : 'Click "Resolve Incident" below'
    },
    {
      step: 7,
      label: 'NEW EXPERIENCE',
      icon: Brain,
      color: isResolved
        ? 'border-sky-500/60 bg-sky-500/15 text-sky-200 shadow-lg shadow-sky-950/40'
        : 'border-slate-800 bg-slate-900 text-slate-500',
      iconColor: isResolved ? 'text-sky-400 animate-pulse' : 'text-slate-600',
      title: isResolved ? `${memorySource} Updated` : 'Will be remembered for future incidents',
      subtitle: isResolved ? 'Stored post-mortem experience' : 'Awaiting resolution'
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-xl">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-wide uppercase">
              Incident Memory Trail
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual pipeline demonstrating how historical operational memory accelerates response & retains future experience.
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
          {memorySource} Flow
        </span>
      </div>

      {/* Horizontal / Grid Visual Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {steps.map((s, index) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className={`relative border rounded-xl p-4 flex flex-col justify-between transition-all ${s.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-950/60 text-slate-300 border border-slate-700/50">
                    STEP 0{s.step}
                  </span>
                  <Icon className={`w-4 h-4 ${s.iconColor}`} />
                </div>
                <h4 className="text-[11px] font-mono font-bold tracking-wider uppercase opacity-80 mb-1">
                  {s.label}
                </h4>
                <p className="text-sm font-semibold leading-snug line-clamp-2 mb-2">
                  {s.title}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/40 text-[11px] opacity-75 font-mono">
                {s.subtitle}
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
