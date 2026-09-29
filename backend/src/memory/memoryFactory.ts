import { IMemoryService } from './memoryService.interface';
import { DemoMemoryService } from './demoMemoryService';
import { HindsightMemoryService } from './hindsightMemoryService';

let activeMemoryServiceInstance: IMemoryService | null = null;

export function getMemoryService(): IMemoryService {
  if (!activeMemoryServiceInstance) {
    const provider = process.env.MEMORY_PROVIDER || 'demo';
    if (provider.toLowerCase() === 'hindsight') {
      console.log('[MemoryService] Initializing HindsightMemoryService Adapter');
      activeMemoryServiceInstance = new HindsightMemoryService();
    } else {
      console.log('[MemoryService] Initializing DemoMemoryService (Local Memory Layer)');
      activeMemoryServiceInstance = new DemoMemoryService();
    }
  }
  return activeMemoryServiceInstance;
}
