import { Router } from 'express';
import { IncidentController } from '../controllers/incidentController';
import { MemoryController } from '../controllers/memoryController';
import { RunbookController } from '../controllers/runbookController';

const router = Router();

// Dashboard & Incidents
router.get('/metrics', IncidentController.getDashboardMetrics);
router.get('/incidents', IncidentController.getIncidents);
router.post('/incidents', IncidentController.createIncident);
router.get('/incidents/:id', IncidentController.getIncidentById);
router.post('/incidents/:id/analyze', IncidentController.analyzeIncident);
router.post('/incidents/:id/resolve', IncidentController.resolveIncident);

// Operational Memory
router.get('/memory/overview', MemoryController.getOverview);
router.get('/memory/items', MemoryController.getMemories);

// Runbooks
router.get('/runbooks', RunbookController.getRunbooks);
router.get('/runbooks/:id', RunbookController.getRunbookById);

export default router;
