import { Request, Response } from 'express';
import { RunbookService } from '../services/runbookService';

const runbookService = new RunbookService();

export class RunbookController {
  public static async getRunbooks(req: Request, res: Response) {
    try {
      const runbooks = runbookService.getAllRunbooks();
      res.json(runbooks);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch runbooks' });
    }
  }

  public static async getRunbookById(req: Request, res: Response) {
    try {
      const runbook = runbookService.getRunbookById(req.params.id);
      if (!runbook) {
        return res.status(404).json({ error: 'Runbook not found' });
      }
      res.json(runbook);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch runbook' });
    }
  }
}
