import {
  AIIncidentAnalysis,
  Incident,
  Runbook,
  SimilarIncidentMatch
} from '../types/incident';
import { INITIAL_RUNBOOKS } from '../data/initialData';
import { getMemoryService } from '../memory/memoryFactory';
import { GroqService } from './groqService';

export class AIService {
  private groqService: GroqService;

  constructor() {
    this.groqService = new GroqService();
  }

  public async analyzeIncident(incident: Incident): Promise<AIIncidentAnalysis> {
    const memoryService = getMemoryService();
    const memorySource = memoryService.getSourceLabel();
    const startTime = Date.now();

    // 1. RECALL: Retrieve similar historical memories from Hindsight Cloud or Demo Memory
    const recallStart = Date.now();
    const similarMatches: SimilarIncidentMatch[] = await memoryService.searchSimilarIncidents(
      incident.title,
      incident.service,
      incident.symptoms,
      incident.id
    );
    const recallDuration = Date.now() - recallStart;

    // 2. REFLECT: Execute memory reflection over recalled operational experience
    const reflectStart = Date.now();
    const reflectExplanation = await memoryService.reflectOnIncident(incident, similarMatches);
    const reflectDuration = Date.now() - reflectStart;

    // 3. Match Suggested Operational Runbook
    const topMatch = similarMatches.length > 0 ? similarMatches[0] : null;
    let suggestedRunbook: Runbook | undefined = undefined;

    if (topMatch && topMatch.incident.runbookUsed) {
      suggestedRunbook = INITIAL_RUNBOOKS.find(
        (r) => r.title.toLowerCase() === topMatch.incident.runbookUsed?.toLowerCase()
      );
    }
    if (!suggestedRunbook) {
      const sLower = incident.symptoms.toLowerCase();
      if (sLower.includes('503') || sLower.includes('connection') || sLower.includes('pool')) {
        suggestedRunbook = INITIAL_RUNBOOKS.find((r) => r.id === 'rb-db-conn-pool');
      } else if (sLower.includes('auth') || sLower.includes('jwt') || sLower.includes('401')) {
        suggestedRunbook = INITIAL_RUNBOOKS.find((r) => r.id === 'rb-auth-credential');
      } else if (sLower.includes('latency') || sLower.includes('slow') || sLower.includes('504')) {
        suggestedRunbook = INITIAL_RUNBOOKS.find((r) => r.id === 'rb-api-latency');
      } else {
        suggestedRunbook = INITIAL_RUNBOOKS.find((r) => r.id === 'rb-service-recovery');
      }
    }

    // 4. LLM REASONING: Send incident telemetry + recalled memories to Groq LLM
    const groqStart = Date.now();
    const analysis = await this.groqService.generateIncidentAnalysis(
      incident,
      similarMatches,
      suggestedRunbook,
      memorySource
    );
    const groqDuration = Date.now() - groqStart;

    // If reflectExplanation returned custom reflection text, enrich explanation
    if (reflectExplanation && analysis.whyThisRecommendation) {
      analysis.whyThisRecommendation.explanation = reflectExplanation;
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[AIService Performance] Hindsight Recall Duration: ${recallDuration}ms`);
    console.log(`[AIService Performance] Hindsight Reflect Duration: ${reflectDuration}ms`);
    console.log(`[AIService Performance] Groq LLM Duration: ${groqDuration}ms`);
    console.log(`[AIService Performance] Total Backend Duration: ${totalDuration}ms`);

    return analysis;
  }
}
