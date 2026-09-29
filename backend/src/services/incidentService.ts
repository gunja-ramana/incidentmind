import { Incident, ResolveIncidentRequest } from '../types/incident';
import { INITIAL_INCIDENTS } from '../data/initialData';
import { AIService } from './aiService';
import { getMemoryService } from '../memory/memoryFactory';

export class IncidentService {
  private incidents: Incident[];
  private aiService: AIService;
  private analysisCache = new Map<string, any>();

  constructor() {
    this.incidents = [...INITIAL_INCIDENTS];
    this.aiService = new AIService();
  }

  public getAllIncidents(filters?: {
    search?: string;
    service?: string;
    severity?: string;
    status?: string;
  }): Incident[] {
    let result = [...this.incidents];

    if (!filters) return result;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.service.toLowerCase().includes(q) ||
          i.symptoms.toLowerCase().includes(q) ||
          (i.actualRootCause && i.actualRootCause.toLowerCase().includes(q))
      );
    }

    if (filters.service && filters.service !== 'All') {
      result = result.filter((i) => i.service === filters.service);
    }

    if (filters.severity && filters.severity !== 'All') {
      result = result.filter((i) => i.severity === filters.severity);
    }

    if (filters.status && filters.status !== 'All') {
      result = result.filter((i) => i.status === filters.status);
    }

    return result;
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((i) => i.id === id);
  }

  public createIncident(data: {
    title: string;
    service: string;
    severity: Incident['severity'];
    environment: Incident['environment'];
    symptoms: string;
    errorLogs?: string;
    additionalContext?: string;
  }): Incident {
    const nextId = `INC-${String(this.incidents.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newIncident: Incident = {
      id: nextId,
      title: data.title,
      service: data.service,
      severity: data.severity,
      environment: data.environment,
      status: 'Active',
      symptoms: data.symptoms,
      errorLogs: data.errorLogs,
      additionalContext: data.additionalContext,
      createdAt: now,
      updatedAt: now
    };

    // Prepend so newest incident appears at top
    this.incidents.unshift(newIncident);
    return newIncident;
  }

  public async analyzeIncident(id: string) {
    const incident = this.getIncidentById(id);
    if (!incident) {
      throw new Error(`Incident with ID ${id} not found.`);
    }

    if (this.analysisCache.has(id)) {
      console.log(`[IncidentService] Returning cached analysis for incident ${id} (<5ms)`);
      return this.analysisCache.get(id);
    }

    if (incident.status === 'Active') {
      incident.status = 'Investigating';
      incident.updatedAt = new Date().toISOString();
    }

    const analysis = await this.aiService.analyzeIncident(incident);
    this.analysisCache.set(id, analysis);
    return analysis;
  }

  public async resolveIncident(id: string, resolution: ResolveIncidentRequest) {
    const incident = this.getIncidentById(id);
    if (!incident) {
      throw new Error(`Incident with ID ${id} not found.`);
    }

    const now = new Date().toISOString();
    incident.status = 'Resolved';
    incident.actualRootCause = resolution.actualRootCause;
    incident.resolutionSteps = resolution.resolutionSteps;
    incident.whatWorked = resolution.whatWorked;
    incident.whatFailed = resolution.whatFailed;
    incident.runbookUsed = resolution.runbookUsed;
    incident.resolutionTimeMinutes = resolution.resolutionTimeMinutes;
    incident.postMortemNotes = resolution.postMortemNotes;
    incident.resolvedAt = now;
    incident.updatedAt = now;

    this.analysisCache.delete(id);

    // RETAIN: Store learning experience in active memory provider
    const memoryService = getMemoryService();
    const storedMemory = await memoryService.storeIncidentExperience(incident);

    return {
      incident,
      storedMemory,
      memorySource: memoryService.getSourceLabel()
    };
  }

  public getDashboardMetrics() {
    const total = this.incidents.length;
    const active = this.incidents.filter((i) => i.status === 'Active' || i.status === 'Investigating').length;
    const resolved = this.incidents.filter((i) => i.status === 'Resolved').length;

    return {
      activeIncidents: active,
      resolvedIncidents: resolved,
      knownIncidents: total,
      successfulResolutions: resolved,
      memorySource: getMemoryService().getSourceLabel()
    };
  }
}
