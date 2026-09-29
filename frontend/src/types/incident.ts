export type Severity = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';
export type Environment = 'Production' | 'Staging' | 'Development';
export type IncidentStatus = 'Active' | 'Investigating' | 'Mitigated' | 'Resolved';

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  environment: Environment;
  status: IncidentStatus;
  symptoms: string;
  errorLogs?: string;
  additionalContext?: string;
  createdAt: string;
  updatedAt: string;
  actualRootCause?: string;
  resolutionSteps?: string;
  whatWorked?: string;
  whatFailed?: string;
  runbookUsed?: string;
  resolutionTimeMinutes?: number;
  postMortemNotes?: string;
  resolvedAt?: string;
}

export interface MemoryItem {
  id: string;
  incidentId: string;
  title: string;
  service: string;
  severity: Severity;
  environment: Environment;
  symptoms: string;
  rootCause: string;
  resolution: string;
  whatWorked: string;
  whatFailed?: string;
  runbookUsed?: string;
  outcome: string;
  resolutionTimeMinutes?: number;
  date: string;
  source: 'Demo Memory' | 'Hindsight Memory';
}

export interface SimilarIncidentMatch {
  incident: MemoryItem;
  relevanceReason: string;
  concreteEvidence?: string[];
  matchScore?: number;
}

export interface MemoryEvidence {
  historicalIncidentId: string;
  title: string;
  service: string;
  previousRootCause: string;
  previousResolution: string;
  whatWorked: string;
  whatFailed?: string;
  runbookUsed?: string;
  outcome: string;
  resolutionTimeMinutes?: number;
  source: 'Demo Memory' | 'Hindsight Memory';
}

export interface RecommendedResponse {
  summary: string;
  investigationSteps: string[];
}

export interface WhyThisRecommendation {
  explanation: string;
  matchingFactors: {
    label: string;
    description: string;
    verified: boolean;
  }[];
  beforeVsAfterLearning: {
    beforeGenericInvestigation: string[];
    afterMemoryInformedInvestigation: string[];
  };
}

export interface Runbook {
  id: string;
  title: string;
  service: string;
  symptoms: string[];
  detection: string;
  verification: string;
  mitigation: string[];
  validation: string;
  escalation: string;
}

export interface AIIncidentAnalysis {
  incidentId: string;
  confirmedInformation: string[];
  historicalInformation: string[];
  aiAssessment: {
    hypothesis: string;
    likelihood: 'High' | 'Medium' | 'Low';
    reasoning: string;
  }[];
  recommendedInvestigation: string[];
  whyThisRecommendation: WhyThisRecommendation;
  similarIncidents: SimilarIncidentMatch[];
  memoryEvidence: MemoryEvidence[];
  recommendedResponse: RecommendedResponse;
  suggestedRunbook?: Runbook;
  memorySource: 'Demo Memory' | 'Hindsight Memory';
  humanConfirmationRequired?: boolean;
}

export interface DashboardMetrics {
  activeIncidents: number;
  resolvedIncidents: number;
  knownIncidents: number;
  successfulResolutions: number;
  memorySource: 'Demo Memory' | 'Hindsight Memory';
}

export interface MemoryOverview {
  totalKnownIncidents: number;
  uniqueRootCauses: number;
  successfulResolutions: number;
  activeRunbooks: number;
  recentLearningsCount: number;
  memorySource: 'Demo Memory' | 'Hindsight Memory';
}

export interface ResolveIncidentRequest {
  actualRootCause: string;
  resolutionSteps: string;
  whatWorked: string;
  whatFailed?: string;
  runbookUsed?: string;
  resolutionTimeMinutes: number;
  postMortemNotes?: string;
}
