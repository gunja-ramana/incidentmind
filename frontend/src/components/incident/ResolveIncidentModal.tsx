import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { ResolveIncidentRequest } from '../../types/incident';

interface ResolveIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveResolution: (resolution: ResolveIncidentRequest) => Promise<void>;
  defaultRunbook?: string;
  incidentTitle: string;
}

export const ResolveIncidentModal: React.FC<ResolveIncidentModalProps> = ({
  isOpen,
  onClose,
  onSaveResolution,
  defaultRunbook = 'Database Connection Exhaustion',
  incidentTitle
}) => {
  const [actualRootCause, setActualRootCause] = useState('');
  const [resolutionSteps, setResolutionSteps] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatFailed, setWhatFailed] = useState('');
  const [runbookUsed, setRunbookUsed] = useState(defaultRunbook);
  const [resolutionTimeMinutes, setResolutionTimeMinutes] = useState('10');
  const [postMortemNotes, setPostMortemNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!actualRootCause.trim()) {
      setError('Please provide the actual root cause.');
      return;
    }
    if (!resolutionSteps.trim()) {
      setError('Please provide resolution steps.');
      return;
    }
    if (!whatWorked.trim()) {
      setError('Please provide what worked during resolution.');
      return;
    }

    try {
      setSubmitting(true);
      await onSaveResolution({
        actualRootCause: actualRootCause.trim(),
        resolutionSteps: resolutionSteps.trim(),
        whatWorked: whatWorked.trim(),
        whatFailed: whatFailed.trim() || undefined,
        runbookUsed: runbookUsed.trim() || undefined,
        resolutionTimeMinutes: Number(resolutionTimeMinutes) || 10,
        postMortemNotes: postMortemNotes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to save incident resolution.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Resolve Incident: ${incidentTitle}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Actual Root Cause <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            value={actualRootCause}
            onChange={(e) => setActualRootCause(e.target.value)}
            placeholder="e.g. Database connection pool exhaustion caused by idle thread retention."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Resolution Steps <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            value={resolutionSteps}
            onChange={(e) => setResolutionSteps(e.target.value)}
            placeholder="e.g. Increased connection pool capacity to 150 and restarted the target service pods."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              What Worked? <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder="e.g. Increasing the connection pool and restarting affected service immediately."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              What Did Not Work? (Optional)
            </label>
            <textarea
              rows={2}
              value={whatFailed}
              onChange={(e) => setWhatFailed(e.target.value)}
              placeholder="e.g. Simple service restart without tuning limits."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Runbook Used
            </label>
            <select
              value={runbookUsed}
              onChange={(e) => setRunbookUsed(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="Database Connection Exhaustion">Database Connection Exhaustion</option>
              <option value="Authentication Credential Failure">Authentication Credential Failure</option>
              <option value="API Latency Investigation">API Latency Investigation</option>
              <option value="Service Availability Recovery">Service Availability Recovery</option>
              <option value="Custom Operational Triage">Custom Operational Triage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Resolution Time (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={resolutionTimeMinutes}
              onChange={(e) => setResolutionTimeMinutes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Post-Mortem Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={postMortemNotes}
            onChange={(e) => setPostMortemNotes(e.target.value)}
            placeholder="e.g. Schedule ticket to update database pool default limits in Helm values chart."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Post-Mortem...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Resolution</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
