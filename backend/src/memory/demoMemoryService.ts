import { IMemoryService } from './memoryService.interface';
import { Incident, MemoryItem, MemoryOverview, SimilarIncidentMatch } from '../types/incident';
import { INITIAL_HISTORICAL_MEMORIES } from '../data/initialData';

export class DemoMemoryService implements IMemoryService {
  private memories: MemoryItem[];

  constructor() {
    this.memories = [...INITIAL_HISTORICAL_MEMORIES];
  }

  getSourceLabel(): 'Demo Memory' | 'Hindsight Memory' {
    return 'Demo Memory';
  }

  async searchSimilarIncidents(
    title: string,
    service: string,
    symptoms: string,
    currentIncidentId?: string
  ): Promise<SimilarIncidentMatch[]> {
    const searchText = `${title} ${service} ${symptoms}`.toLowerCase();
    const words = searchText.split(/\W+/).filter((w) => w.length > 2);

    const matches: SimilarIncidentMatch[] = [];

    for (const mem of this.memories) {
      if (currentIncidentId && (mem.incidentId.toLowerCase() === currentIncidentId.toLowerCase() || mem.id.toLowerCase() === currentIncidentId.toLowerCase())) {
        continue; // Skip self-match
      }
      let score = 0;
      const reasons: string[] = [];

      // Check service match
      if (mem.service.toLowerCase() === service.toLowerCase()) {
        score += 40;
        reasons.push(`Same target service (${mem.service})`);
      } else if (
        mem.service.toLowerCase().includes(service.toLowerCase()) ||
        service.toLowerCase().includes(mem.service.toLowerCase())
      ) {
        score += 20;
        reasons.push(`Related service (${mem.service})`);
      }

      // Check symptom / keyword overlaps
      const memText = `${mem.title} ${mem.symptoms} ${mem.rootCause}`.toLowerCase();
      const matchedKeywords: string[] = [];

      for (const word of words) {
        if (memText.includes(word) && !['the', 'and', 'for', 'with', 'from', 'this', 'that'].includes(word)) {
          score += 10;
          if (!matchedKeywords.includes(word)) {
            matchedKeywords.push(word);
          }
        }
      }

      if (matchedKeywords.length > 0) {
        reasons.push(`Matching symptom keywords: ${matchedKeywords.slice(0, 3).join(', ')}`);
      }

      if (score >= 20 || reasons.length > 0) {
        const normalizedScore = Math.min(Math.round(score), 98);
        matches.push({
          incident: { ...mem, source: 'Demo Memory' },
          relevanceReason: reasons.join(' · ') || 'Similar error symptoms and operational profile.',
          matchScore: normalizedScore
        });
      }
    }

    // Sort by match score descending
    matches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return matches;
  }

  async reflectOnIncident(
    incident: Incident,
    similarMatches: SimilarIncidentMatch[]
  ): Promise<string | null> {
    if (similarMatches.length === 0) return null;
    const top = similarMatches[0];
    return `[Demo Memory Reflection] Incident "${incident.title}" on ${incident.service} matches historical incident ${top.incident.incidentId} (${top.incident.title}). Recommended primary investigation focus: ${top.incident.rootCause}.`;
  }

  async storeIncidentExperience(incident: Incident): Promise<MemoryItem> {
    const newMemory: MemoryItem = {
      id: `mem-${Date.now()}`,
      incidentId: incident.id,
      title: incident.title,
      service: incident.service,
      severity: incident.severity,
      environment: incident.environment,
      symptoms: incident.symptoms,
      rootCause: incident.actualRootCause || 'Under investigation',
      resolution: incident.resolutionSteps || 'Applied standard recovery',
      whatWorked: incident.whatWorked || 'Troubleshooting and service restart',
      whatFailed: incident.whatFailed || undefined,
      runbookUsed: incident.runbookUsed || undefined,
      outcome: 'Resolved successfully',
      resolutionTimeMinutes: incident.resolutionTimeMinutes || 10,
      date: new Date().toISOString().split('T')[0],
      source: 'Demo Memory'
    };

    // Prepend to memories store so latest is first
    this.memories.unshift(newMemory);
    return newMemory;
  }

  async getMemoryOverview(): Promise<MemoryOverview> {
    const uniqueCauses = new Set(this.memories.map((m) => m.rootCause)).size;
    const uniqueRunbooks = new Set(this.memories.map((m) => m.runbookUsed).filter(Boolean)).size;

    return {
      totalKnownIncidents: this.memories.length,
      uniqueRootCauses: uniqueCauses,
      successfulResolutions: this.memories.filter((m) => m.outcome.includes('Resolved')).length,
      activeRunbooks: uniqueRunbooks || 4,
      recentLearningsCount: this.memories.length,
      memorySource: 'Demo Memory'
    };
  }

  async getMemoryItems(): Promise<MemoryItem[]> {
    return this.memories.map((m) => ({ ...m, source: 'Demo Memory' }));
  }
}
