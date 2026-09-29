import React from 'react';
import { History, AlertCircle, CheckCircle2, Clock, BookOpen, Sparkles } from 'lucide-react';
import { SimilarIncidentMatch } from '../../types/incident';
import { SeverityBadge, MemorySourceBadge } from '../ui/Badge';

interface SimilarIncidentsListProps {
  matches: SimilarIncidentMatch[];
  memorySource?: 'Demo Memory' | 'Hindsight Memory';
}

export const SimilarIncidentsList: React.FC<SimilarIncidentsListProps> = ({
  matches,
  memorySource = 'Demo Memory'
}) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center my-6">
        <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">
          No closely matching historical incident was found.
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          IncidentMind searched operational records but found no past incidents with matching symptom vectors. Standard triage runbooks are recommended.
        </p>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            Similar Historical Incidents
          </h2>
        </div>
        <MemorySourceBadge source={memorySource} />
      </div>

      <div className="space-y-4">
        {matches.map((m) => {
          const inc = m.incident;
          return (
            <div
              key={inc.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-purple-500/40 transition-all shadow-md"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={inc.severity} />
                  <h3 className="font-semibold text-slate-100 text-base">{inc.title}</h3>
                  <span className="text-xs font-mono text-slate-400">({inc.incidentId})</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{inc.service}</span>
                  <span>·</span>
                  <span>{inc.date}</span>
                </div>
              </div>

              {/* Why relevant callout */}
              <div className="bg-purple-950/30 border border-purple-800/40 rounded-lg p-3 mb-4 text-xs">
                <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Why this incident is relevant</span>
                </div>
                <p className="text-purple-200/90 font-mono leading-relaxed">
                  {m.relevanceReason}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Symptoms Observed
                  </span>
                  <p className="text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800 font-mono">
                    {inc.symptoms}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Previous Root Cause
                  </span>
                  <p className="text-amber-300/90 bg-slate-950/60 p-2.5 rounded border border-amber-900/30 font-mono">
                    {inc.rootCause}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
                <div>
                  <span className="font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Previous Successful Resolution
                  </span>
                  <p className="text-emerald-300/90 bg-slate-950/60 p-2.5 rounded border border-emerald-900/30 font-mono">
                    {inc.resolution}
                  </p>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Runbook & Outcome
                    </span>
                    <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800 font-mono">
                      <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{inc.runbookUsed || 'Standard Runbook'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer outcome */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{inc.outcome}</span>
                </div>
                {inc.resolutionTimeMinutes && (
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Resolution time: {inc.resolutionTimeMinutes} mins</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
