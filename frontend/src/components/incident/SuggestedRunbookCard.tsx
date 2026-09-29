import React from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Runbook } from '../../types/incident';

interface SuggestedRunbookCardProps {
  runbook?: Runbook;
  onOpenRunbookModal?: (runbook: Runbook) => void;
}

export const SuggestedRunbookCard: React.FC<SuggestedRunbookCardProps> = ({
  runbook,
  onOpenRunbookModal
}) => {
  if (!runbook) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 my-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            Suggested Operational Runbook
          </h2>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
          Target Service: {runbook.service}
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-100 mb-4">{runbook.title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mb-4">
        <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
          <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
            🔍 Detection
          </span>
          <p className="text-slate-300">{runbook.detection}</p>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
          <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
            ⚡ Verification
          </span>
          <p className="text-slate-300">{runbook.verification}</p>
        </div>
      </div>

      <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 text-xs mb-4">
        <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-2 font-mono">
          🛠️ Mitigation Steps
        </span>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-mono">
          {runbook.mitigation.map((step, idx) => (
            <li key={idx} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/30">
          <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            ✅ Validation
          </span>
          <p className="text-emerald-200/90">{runbook.validation}</p>
        </div>

        <div className="bg-rose-950/20 p-3 rounded-lg border border-rose-900/30">
          <span className="font-bold text-rose-400 uppercase tracking-wider block mb-1">
            🚨 Escalation Path
          </span>
          <p className="text-rose-200/90">{runbook.escalation}</p>
        </div>
      </div>

      {onOpenRunbookModal && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => onOpenRunbookModal(runbook)}
            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <span>View Full Runbook Procedure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
