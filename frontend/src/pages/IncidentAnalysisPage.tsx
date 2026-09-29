import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Brain,
  Loader2,
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { AIIncidentAnalysis, Incident, ResolveIncidentRequest, Runbook } from '../types/incident';
import { api } from '../services/api';
import { SeverityBadge, StatusBadge, MemorySourceBadge } from '../components/ui/Badge';
import { TrustBanner } from '../components/ui/TrustBanner';
import { SimilarIncidentsList } from '../components/incident/SimilarIncidentsList';
import { MemoryEvidenceCard } from '../components/incident/MemoryEvidenceCard';
import { SuggestedRunbookCard } from '../components/incident/SuggestedRunbookCard';
import { IncidentMemoryTrail } from '../components/incident/IncidentMemoryTrail';
import { WhyThisRecommendationCard } from '../components/incident/WhyThisRecommendationCard';
import { ResolveIncidentModal } from '../components/incident/ResolveIncidentModal';
import { IncidentLearningBanner } from '../components/incident/IncidentLearningBanner';

interface IncidentAnalysisPageProps {
  incidentId: string;
  onNavigate: (view: any, params?: any) => void;
  onOpenRunbookModal?: (runbook: Runbook) => void;
}

export const IncidentAnalysisPage: React.FC<IncidentAnalysisPageProps> = ({
  incidentId,
  onNavigate,
  onOpenRunbookModal
}) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [analysis, setAnalysis] = useState<AIIncidentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionResult, setResolutionResult] = useState<{ incident: Incident; memorySource?: 'Demo Memory' | 'Hindsight Memory' } | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    'IncidentMind is investigating telemetry...',
    'Recalling relevant organizational memories from Hindsight...',
    'Comparing previous incident root causes & resolutions...',
    'Generating Groq LLM triage recommendation...'
  ];

  useEffect(() => {
    fetchIncidentAndAnalysis();
  }, [incidentId]);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }

    const t1 = setTimeout(() => setLoadingStep(1), 1200);
    const t2 = setTimeout(() => setLoadingStep(2), 2500);
    const t3 = setTimeout(() => setLoadingStep(3), 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading]);

  const fetchIncidentAndAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const incData = await api.getIncidentById(incidentId);
      setIncident(incData);

      const analysisData = await api.analyzeIncident(incidentId);
      setAnalysis(analysisData);

      if (incData.status === 'Resolved' && incData.actualRootCause) {
        setResolutionResult({
          incident: incData,
          memorySource: analysisData.memorySource
        });
      }
    } catch (err: any) {
      setError(err.message || 'Unable to analyze incident. Please check API server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResolution = async (resolution: ResolveIncidentRequest) => {
    const result = await api.resolveIncident(incidentId, resolution);
    setIncident(result.incident);
    setResolutionResult({
      incident: result.incident,
      memorySource: result.memorySource
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <Brain className="w-12 h-12 text-sky-400 animate-pulse" />
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin absolute -top-2 -left-2" />
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-base font-bold text-slate-200">IncidentMind Analysis Pipeline</h3>
          <p className="text-xs text-sky-400 font-mono mt-1 font-semibold transition-all">
            {loadingMessages[loadingStep]}
          </p>
          <div className="flex justify-center gap-1.5 mt-3">
            {loadingMessages.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx <= loadingStep ? 'w-6 bg-sky-400' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !incident || !analysis) {
    return (
      <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-8 text-center max-w-xl mx-auto my-8 space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-100">Unable to analyze this incident.</h3>
        <p className="text-xs text-rose-300 font-mono">{error || 'Incident analysis data missing.'}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={fetchIncidentAndAnalysis}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white text-xs font-bold rounded-lg shadow-md transition-all"
          >
            Retry Incident Analysis
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const topMatch = analysis.similarIncidents.length > 0 ? analysis.similarIncidents[0] : undefined;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              {incident.title}
            </h1>
            <span className="text-xs font-mono text-slate-400">({incident.id})</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
            <span>Service: {incident.service}</span>
            <span>·</span>
            <span>Env: {incident.environment}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />

          {incident.status !== 'Resolved' && (
            <button
              onClick={() => setIsResolveModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-950/40 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Resolve Incident</span>
            </button>
          )}
        </div>
      </div>

      {/* Human-in-the-loop Callout Banner */}
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-amber-300 block font-mono">AGENT RECOMMENDATION</span>
            <span className="text-amber-200/90 font-mono">
              Decision support guidance. No autonomous production changes executed.
            </span>
          </div>
        </div>
        <div className="bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/40 font-mono font-bold text-[11px] shrink-0">
          STATUS: Human Confirmation Required
        </div>
      </div>

      {/* Trust & Transparency Banner */}
      <TrustBanner />

      {/* Incident Learning Banner if resolved */}
      {resolutionResult && (
        <IncidentLearningBanner
          memorySource={resolutionResult.memorySource}
          onNavigateToMemory={() => onNavigate('memory')}
        />
      )}

      {/* Signature Feature: Incident Memory Trail */}
      <IncidentMemoryTrail
        currentIncident={incident}
        topSimilarMatch={topMatch}
        isResolved={incident.status === 'Resolved'}
        actualRootCause={incident.actualRootCause}
        resolutionSteps={incident.resolutionSteps}
        memorySource={analysis.memorySource}
      />

      {/* Current Incident Assessment */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              Structured Incident Assessment
            </h2>
          </div>
          <MemorySourceBadge source={analysis.memorySource} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Confirmed Information */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider font-mono">
                CONFIRMED INFORMATION
              </h3>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Fact</span>
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              {analysis.confirmedInformation.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sky-400 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Historical Information */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                HISTORICAL INFORMATION
              </h3>
              <span className="text-[10px] font-mono text-purple-400 uppercase">{analysis.memorySource}</span>
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              {analysis.historicalInformation.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Assessment & Hypotheses */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                AI ASSESSMENT
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 uppercase">Hypothesis</span>
            </div>
            <div className="space-y-3 text-xs">
              {analysis.aiAssessment.map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-2.5 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200">{item.hypothesis}</span>
                    <span className="text-[10px] font-mono text-rose-300">{item.likelihood}</span>
                  </div>
                  <p className="text-slate-400 font-mono text-[11px] leading-relaxed">
                    {item.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Investigation Steps */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
            Recommended Investigation Steps
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {analysis.recommendedInvestigation.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 bg-slate-950/60 border border-slate-800 p-3 rounded-lg text-slate-200"
              >
                <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why This Recommendation? */}
      {analysis.whyThisRecommendation && (
        <WhyThisRecommendationCard
          whyRecommendation={analysis.whyThisRecommendation}
          memorySource={analysis.memorySource}
        />
      )}

      {/* Similar Historical Incidents */}
      <SimilarIncidentsList matches={analysis.similarIncidents} memorySource={analysis.memorySource} />

      {/* Memory Evidence */}
      <MemoryEvidenceCard evidence={analysis.memoryEvidence} memorySource={analysis.memorySource} />

      {/* Suggested Runbook */}
      <SuggestedRunbookCard
        runbook={analysis.suggestedRunbook}
        onOpenRunbookModal={onOpenRunbookModal}
      />

      {/* Resolve Modal */}
      <ResolveIncidentModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onSaveResolution={handleSaveResolution}
        defaultRunbook={analysis.suggestedRunbook?.title}
        incidentTitle={incident.title}
      />
    </div>
  );
};
