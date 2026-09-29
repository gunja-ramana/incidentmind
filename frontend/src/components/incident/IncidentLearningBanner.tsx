import React from 'react';
import { Brain, CheckCircle2, ArrowRight } from 'lucide-react';
import { MemorySourceBadge } from '../ui/Badge';

interface IncidentLearningBannerProps {
  memorySource?: 'Demo Memory' | 'Hindsight Memory';
  onNavigateToMemory?: () => void;
}

export const IncidentLearningBanner: React.FC<IncidentLearningBannerProps> = ({
  memorySource = 'Demo Memory',
  onNavigateToMemory
}) => {
  const capturedItems = [
    'Root cause',
    'Resolution steps',
    'Successful troubleshooting step',
    'Failed troubleshooting step',
    'Runbook',
    'Outcome',
    'Resolution time'
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/40 rounded-xl p-6 my-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-sky-400 animate-pulse" />
            <h2 className="text-xl font-extrabold text-slate-100 tracking-wide">
              INCIDENT LEARNING
            </h2>
          </div>
          <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Incident resolved successfully. Operational experience ingested.</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-sky-300 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/30">
            {memorySource} Updated
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
          New Experience Captured & Ingested into {memorySource}:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
          {capturedItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-lg text-emerald-300 font-mono"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {onNavigateToMemory && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onNavigateToMemory}
            className="flex items-center gap-2 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <span>Browse Memory Base & Learning Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
