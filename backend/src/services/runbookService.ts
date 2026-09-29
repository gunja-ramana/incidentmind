import { Runbook } from '../types/incident';
import { INITIAL_RUNBOOKS } from '../data/initialData';

export class RunbookService {
  private runbooks: Runbook[];

  constructor() {
    this.runbooks = [...INITIAL_RUNBOOKS];
  }

  public getAllRunbooks(): Runbook[] {
    return this.runbooks;
  }

  public getRunbookById(id: string): Runbook | undefined {
    return this.runbooks.find((r) => r.id === id);
  }
}
