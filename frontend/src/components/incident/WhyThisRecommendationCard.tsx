import React from 'react';
import { HelpCircle, CheckCircle2, ArrowRight, Lightbulb, History, Sparkles } from 'lucide-react';
import { WhyThisRecommendation } from '../../types/incident';

interface WhyThisRecommendationCardProps {
  whyRecommendation: WhyThisRecommendation;
  memorySource?: 'Demo Memory' | 'Hindsight Memory';
}

export const WhyThisRecommendationCard: React.FC<WhyThisRecommendationCardProps> = ({
  whyRecommendation,
  memorySource = 'Demo Memory'
}) => {
  if (!whyRecommendation) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 my-6 shadow-xl space-y-6">
      {/* Top Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            Why This Recommendation?
          </h2>
        </div>
        <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
          Powered by Operational Memory
        </span>
      </div>

      <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-lg border border-slate-800">
        {whyRecommendation.explanation}
      </p>

      {/* Matching Factors List */}
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
          Recommendation Evidence Checklist:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
          {whyRecommendation.matchingFactors.map((factor, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex flex-col justify-between ${
                factor.verified
                  ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{factor.label}</span>
              </div>
              <span className="text-[11px] opacity-80 leading-snug">{factor.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Before / After Learning Comparative Box */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 mt-4">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Operational Learning: Before vs After Memory Recall
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Before Memory */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-sans">
              Without Memory (Generic Triage)
            </span>
            <ul className="space-y-2 text-slate-400">
              {whyRecommendation.beforeVsAfterLearning.beforeGenericInvestigation.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-slate-600">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After Memory */}
          <div className="bg-sky-950/30 border border-sky-500/40 p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider font-sans">
                With {memorySource} (Contextual Fix)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                Faster Triage
              </span>
            </div>
            <ul className="space-y-2 text-sky-200">
              {whyRecommendation.beforeVsAfterLearning.afterMemoryInformedInvestigation.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
