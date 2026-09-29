import React, { useEffect, useState } from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Runbook } from '../types/incident';
import { api } from '../services/api';
import { Modal } from '../components/ui/Modal';

interface RunbooksPageProps {
  selectedRunbookId?: string;
}

export const RunbooksPage: React.FC<RunbooksPageProps> = ({ selectedRunbookId }) => {
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalRunbook, setActiveModalRunbook] = useState<Runbook | null>(null);

  useEffect(() => {
    loadRunbooks();
  }, []);

  useEffect(() => {
    if (selectedRunbookId && runbooks.length > 0) {
      const found = runbooks.find((r) => r.id === selectedRunbookId);
      if (found) setActiveModalRunbook(found);
    }
  }, [selectedRunbookId, runbooks]);

  const loadRunbooks = async () => {
    try {
      setLoading(true);
      const data = await api.getRunbooks();
      setRunbooks(data);
    } catch (err) {
      console.error('Failed to load runbooks', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin mr-3" />
        <span className="text-xs font-mono text-slate-400">Loading Operational Runbooks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Operational Runbooks
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized incident triage procedures, verification commands, and escalation matrix.
          </p>
        </div>
        <span className="text-xs font-mono text-sky-300 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">
          {runbooks.length} Verified Runbooks
        </span>
      </div>

      {/* Grid of Runbooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {runbooks.map((rb) => (
          <div
            key={rb.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-sky-500/40 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <h2 className="text-base font-bold text-slate-100">{rb.title}</h2>
                <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                  {rb.service}
                </span>
              </div>

              {/* Symptoms */}
              <div className="mb-4">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Target Symptoms
                </span>
                <ul className="space-y-1 text-xs text-slate-300 font-mono">
                  {rb.symptoms.map((sym, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400">•</span>
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mitigation Overview */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 mb-4 text-xs font-mono">
                <span className="font-bold text-emerald-400 uppercase block mb-1">
                  Primary Mitigation
                </span>
                <p className="text-slate-300 line-clamp-2">{rb.mitigation[0]}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">ID: {rb.id}</span>
              <button
                onClick={() => setActiveModalRunbook(rb)}
                className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
              >
                <span>Open Full Procedure</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Runbook Detail Modal */}
      {activeModalRunbook && (
        <Modal
          isOpen={!!activeModalRunbook}
          onClose={() => setActiveModalRunbook(null)}
          title={`Runbook: ${activeModalRunbook.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400">Target Service: {activeModalRunbook.service}</span>
              <span className="text-sky-400 font-bold">Verified Operational Procedure</span>
            </div>

            <div>
              <span className="font-bold text-slate-300 uppercase tracking-wider block mb-2">
                1. Target Symptoms
              </span>
              <ul className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-slate-300">
                {activeModalRunbook.symptoms.map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-rose-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="font-bold text-slate-400 uppercase block mb-1">
                  2. Detection Alarm
                </span>
                <p className="text-slate-300">{activeModalRunbook.detection}</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="font-bold text-slate-400 uppercase block mb-1">
                  3. Verification Command
                </span>
                <p className="text-slate-300">{activeModalRunbook.verification}</p>
              </div>
            </div>

            <div>
              <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                4. Step-by-Step Mitigation
              </span>
              <ol className="bg-slate-950 p-4 rounded-lg border border-slate-800 list-decimal list-inside space-y-2 text-slate-200">
                {activeModalRunbook.mitigation.map((m, i) => (
                  <li key={i} className="leading-relaxed">
                    {m}
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-950/20 p-3.5 rounded-lg border border-emerald-900/30">
                <span className="font-bold text-emerald-400 uppercase block mb-1">
                  5. Validation Target
                </span>
                <p className="text-emerald-200/90">{activeModalRunbook.validation}</p>
              </div>

              <div className="bg-rose-950/20 p-3.5 rounded-lg border border-rose-900/30">
                <span className="font-bold text-rose-400 uppercase block mb-1">
                  6. Escalation Protocol
                </span>
                <p className="text-rose-200/90">{activeModalRunbook.escalation}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
