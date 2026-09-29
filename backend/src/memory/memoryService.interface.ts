import { Incident, MemoryItem, MemoryOverview, SimilarIncidentMatch } from '../types/incident';

export interface IMemoryService {
  getSourceLabel(): 'Demo Memory' | 'Hindsight Memory';
  
  // RECALL: Find past operational experience relevant to current symptoms & service
  searchSimilarIncidents(
    title: string,
    service: string,
    symptoms: string,
    currentIncidentId?: string
  ): Promise<SimilarIncidentMatch[]>;

  // REFLECT: Contextual reasoning over current symptoms and historical memory
  reflectOnIncident(
    incident: Incident,
    similarMatches: SimilarIncidentMatch[]
  ): Promise<string | null>;

  // RETAIN: Store post-mortem experience after an incident is resolved
  storeIncidentExperience(incident: Incident): Promise<MemoryItem>;

  // Overview stats & memory item list
  getMemoryOverview(): Promise<MemoryOverview>;
  getMemoryItems(): Promise<MemoryItem[]>;
}
