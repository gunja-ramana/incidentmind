import React from 'react';
import { Brain, CheckCircle2, XCircle, Clock, BookOpen } from 'lucide-react';
import { MemoryEvidence } from '../../types/incident';
import { MemorySourceBadge } from '../ui/Badge';

interface MemoryEvidenceCardProps {
  evidence: MemoryEvidence[];
  memorySource?: 'Demo Memory' | 'Hindsight Memory';
}

export const MemoryEvidenceCard: React.FC<MemoryEvidenceCardProps> = ({
  evidence,
  memorySource = 'Demo Memory'
}) => {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            Memory Evidence
          </h2>
        </div>
        <MemorySourceBadge source={memorySource} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidence.map((item, idx) => (
          <div
            key={`${item.historicalIncidentId}-${idx}`}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <h3 className="font-semibold text-slate-200 text-sm">{item.title}</h3>
                <span className="text-xs font-mono text-slate-400">{item.service}</span>
              </div>

              {/* Previous Root Cause */}
              <div className="mb-3">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Previous Root Cause
                </span>
                <p className="text-xs text-amber-300/90 font-mono bg-slate-950/70 p-2 rounded border border-amber-900/30">
                  {item.previousRootCause}
                </p>
              </div>

              {/* Previous Successful Resolution */}
              <div className="mb-3">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Previous Successful Resolution
                </span>
                <p className="text-xs text-emerald-300/90 font-mono bg-slate-950/70 p-2 rounded border border-emerald-900/30">
                  {item.previousResolution}
                </p>
              </div>

              {/* What Worked & What Failed */}
              <div className="space-y-2 text-xs mb-3">
                <div className="flex items-start gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-300 block">What Worked:</span>
                    <span className="text-slate-400 font-mono text-[11px]">{item.whatWorked}</span>
                  </div>
                </div>

                {item.whatFailed && (
                  <div className="flex items-start gap-2 text-rose-400">
                    <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-300 block">What Failed:</span>
                      <span className="text-slate-400 font-mono text-[11px]">{item.whatFailed}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer info */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>{item.runbookUsed || 'Operational Runbook'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{item.resolutionTimeMinutes ? `${item.resolutionTimeMinutes}m` : item.outcome}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
