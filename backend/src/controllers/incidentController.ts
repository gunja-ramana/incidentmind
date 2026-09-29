import { Request, Response } from 'express';
import { IncidentService } from '../services/incidentService';

const incidentService = new IncidentService();

export class IncidentController {
  public static async getDashboardMetrics(req: Request, res: Response) {
    try {
      const metrics = incidentService.getDashboardMetrics();
      res.json(metrics);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to load metrics' });
    }
  }

  public static async getIncidents(req: Request, res: Response) {
    try {
      const { search, service, severity, status } = req.query;
      const incidents = incidentService.getAllIncidents({
        search: search as string,
        service: service as string,
        severity: severity as string,
        status: status as string
      });
      res.json(incidents);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch incidents' });
    }
  }

  public static async getIncidentById(req: Request, res: Response) {
    try {
      const incident = incidentService.getIncidentById(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      res.json(incident);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch incident' });
    }
  }

  public static async createIncident(req: Request, res: Response) {
    try {
      const { title, service, severity, environment, symptoms, errorLogs, additionalContext } = req.body;

      if (!title || !service || !severity || !environment || !symptoms) {
        return res.status(400).json({ error: 'Missing required incident fields.' });
      }

      const incident = incidentService.createIncident({
        title,
        service,
        severity,
        environment,
        symptoms,
        errorLogs,
        additionalContext
      });

      res.status(201).json(incident);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create incident' });
    }
  }

  public static async analyzeIncident(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const analysis = await incidentService.analyzeIncident(id);
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to analyze incident' });
    }
  }

  public static async resolveIncident(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { actualRootCause, resolutionSteps, whatWorked, whatFailed, runbookUsed, resolutionTimeMinutes, postMortemNotes } = req.body;

      if (!actualRootCause || !resolutionSteps || !whatWorked || !resolutionTimeMinutes) {
        return res.status(400).json({ error: 'Missing required resolution fields.' });
      }

      const result = await incidentService.resolveIncident(id, {
        actualRootCause,
        resolutionSteps,
        whatWorked,
        whatFailed,
        runbookUsed,
        resolutionTimeMinutes: Number(resolutionTimeMinutes),
        postMortemNotes
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save incident resolution' });
    }
  }
}
