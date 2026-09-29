import {
  AIIncidentAnalysis,
  DashboardMetrics,
  Incident,
  MemoryItem,
  MemoryOverview,
  ResolveIncidentRequest,
  Runbook
} from '../types/incident';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      signal: controller.signal,
      ...options
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.error || `HTTP error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('IncidentMind API request timed out after 20 seconds. Please click Retry.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  // Metrics & Incidents
  getMetrics: () => fetchJson<DashboardMetrics>('/metrics'),
  
  getIncidents: (filters?: { search?: string; service?: string; severity?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.service) params.append('service', filters.service);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Incident[]>(`/incidents${queryString}`);
  },

  getIncidentById: (id: string) => fetchJson<Incident>(`/incidents/${id}`),

  createIncident: (data: {
    title: string;
    service: string;
    severity: Incident['severity'];
    environment: Incident['environment'];
    symptoms: string;
    errorLogs?: string;
    additionalContext?: string;
  }) => fetchJson<Incident>('/incidents', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  analyzeIncident: (id: string) => fetchJson<AIIncidentAnalysis>(`/incidents/${id}/analyze`, {
    method: 'POST'
  }),

  resolveIncident: (id: string, resolution: ResolveIncidentRequest) => fetchJson<{
    incident: Incident;
    storedMemory: MemoryItem;
    memorySource: 'Demo Memory' | 'Hindsight Memory';
  }>(`/incidents/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(resolution)
  }),

  // Operational Memory
  getMemoryOverview: () => fetchJson<MemoryOverview>('/memory/overview'),
  getMemoryItems: () => fetchJson<MemoryItem[]>('/memory/items'),

  // Runbooks
  getRunbooks: () => fetchJson<Runbook[]>('/runbooks'),
  getRunbookById: (id: string) => fetchJson<Runbook>(`/runbooks/${id}`)
};
