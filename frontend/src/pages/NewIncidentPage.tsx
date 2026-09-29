import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { Severity, Environment } from '../types/incident';
import { api } from '../services/api';

interface NewIncidentPageProps {
  onNavigate: (view: any, params?: any) => void;
}

export const NewIncidentPage: React.FC<NewIncidentPageProps> = ({ onNavigate }) => {
  const [title, setTitle] = useState('');
  const [service, setService] = useState('Payment API');
  const [severity, setSeverity] = useState<Severity>('SEV-1');
  const [environment, setEnvironment] = useState<Environment>('Production');
  const [symptoms, setSymptoms] = useState('');
  const [errorLogs, setErrorLogs] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fillPaymentDemoData = () => {
    setTitle('Payment API 503 Errors and High Database Connections');
    setService('Payment API');
    setSeverity('SEV-2');
    setEnvironment('Production');
    setSymptoms(
      'The Payment API is returning HTTP 503 errors. Request latency has increased significantly. Database connection utilization is very high. Multiple payment requests are failing intermittently.'
    );
    setErrorLogs(
      'HTTP 503 Service Unavailable. Database connection pool utilization is near 100%. Active database connections have increased significantly. Payment API request failures increased during the same period.'
    );
    setAdditionalContext(
      'The issue started shortly after increased payment traffic. No external payment gateway outage has been confirmed. The service was healthy earlier.'
    );
    setValidationError(null);
  };

  const fillAuthDemoData = () => {
    setTitle('Authentication Service global 401 token failure');
    setService('Authentication Service');
    setSeverity('SEV-1');
    setEnvironment('Production');
    setSymptoms('Users unable to authenticate across web and mobile apps. Microservices rejecting JWT bearer tokens.');
    setErrorLogs('[ERROR] AuthValidator: Failed to verify RSA signature. Signing key not found or expired.');
    setAdditionalContext('Routine TLS key rotation was scheduled last night.');
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Incident Title is required.');
      return;
    }
    if (!service.trim()) {
      setValidationError('Service name is required.');
      return;
    }
    if (!symptoms.trim() || symptoms.trim().length < 15) {
      setValidationError('Symptoms description must be at least 15 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      const newIncident = await api.createIncident({
        title: title.trim(),
        service: service.trim(),
        severity,
        environment,
        symptoms: symptoms.trim(),
        errorLogs: errorLogs.trim() || undefined,
        additionalContext: additionalContext.trim() || undefined
      });

      // Automatically launch Incident Analysis view for created incident
      onNavigate('analysis', { incidentId: newIncident.id });
    } catch (err: any) {
      setValidationError(err.message || 'Failed to create and analyze incident.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Report New Incident
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Input observed operational symptoms to trigger historical memory recall & root-cause analysis.
          </p>
        </div>

        {/* Quick Demo Pre-fill helper */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Quick Demo Presets:</span>
          <button
            type="button"
            onClick={fillPaymentDemoData}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-mono font-semibold rounded border border-slate-700 transition-colors"
          >
            Payment 503 (SEV-2)
          </button>
          <button
            type="button"
            onClick={fillAuthDemoData}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-400 text-xs font-mono font-semibold rounded border border-slate-700 transition-colors"
          >
            Auth Outage (SEV-1)
          </button>
        </div>
      </div>

      {validationError && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        {/* Incident Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Incident Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Payment API returning 503 errors"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            required
          />
        </div>

        {/* Service & Severity & Environment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Service <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. Payment API"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Severity Level <span className="text-rose-400">*</span>
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="SEV-1">SEV-1 Critical</option>
              <option value="SEV-2">SEV-2 High</option>
              <option value="SEV-3">SEV-3 Medium</option>
              <option value="SEV-4">SEV-4 Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Environment <span className="text-rose-400">*</span>
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as Environment)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Development">Development</option>
            </select>
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Observed Symptoms <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe what users or monitors are observing, e.g.: Users are receiving 503 responses from the payment API. Error rate increased significantly during the last 10 minutes."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
            required
          />
        </div>

        {/* Error / Log Information */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Error / Log Information (Optional)
          </label>
          <textarea
            rows={3}
            value={errorLogs}
            onChange={(e) => setErrorLogs(e.target.value)}
            placeholder="Paste raw stack traces, log lines, or Grafana alert payloads..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
          />
        </div>

        {/* Additional Context */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Additional Operational Context (Optional)
          </label>
          <textarea
            rows={2}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Recent deployments, traffic changes, maintenance windows, infrastructure changes..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
          />
        </div>

        {/* Form Action */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-xl shadow-sky-950/40 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Searching Demo Memory & Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze Incident</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
