import React from 'react';
import { AlertCircle, Info, Sparkles, History } from 'lucide-react';

export const TrustBanner: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
            Operational Decision Support System
          </span>
        </div>
        <div className="text-xs text-amber-200/90 font-medium flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
          <span>⚠️ Verify recommendations before applying changes to production.</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="flex items-start gap-2 text-slate-300">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-sky-300 block">Confirmed Information</span>
            Verifiable facts supplied by the engineer (symptoms, logs, environment).
          </div>
        </div>
        <div className="flex items-start gap-2 text-slate-300">
          <History className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-purple-300 block">Historical Information</span>
            Retrieved records from past incidents in operational memory.
          </div>
        </div>
        <div className="flex items-start gap-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-300 block">AI Assessment</span>
            Probabilistic hypotheses and suggested investigation steps.
          </div>
        </div>
      </div>
    </div>
  );
};
