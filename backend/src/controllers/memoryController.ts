import { Request, Response } from 'express';
import { getMemoryService } from '../memory/memoryFactory';

export class MemoryController {
  public static async getOverview(req: Request, res: Response) {
    try {
      const memoryService = getMemoryService();
      const overview = await memoryService.getMemoryOverview();
      res.json(overview);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch memory overview' });
    }
  }

  public static async getMemories(req: Request, res: Response) {
    try {
      const memoryService = getMemoryService();
      const memories = await memoryService.getMemoryItems();
      res.json(memories);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch memory items' });
    }
  }
}
