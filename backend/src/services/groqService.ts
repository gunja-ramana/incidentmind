import Groq from 'groq-sdk';
import { AIIncidentAnalysis, Incident, Runbook, SimilarIncidentMatch, WhyThisRecommendation } from '../types/incident';

export class GroqService {
  private groq: Groq | null = null;
  private model: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    if (apiKey) {
      try {
        console.log(`[GroqService] Initializing Groq SDK with model: ${this.model}`);
        this.groq = new Groq({ apiKey });
      } catch (err: any) {
        console.error('[GroqService] Initialization error:', err.message);
      }
    } else {
      console.warn('[GroqService] GROQ_API_KEY is not configured in backend environment.');
    }
  }

  public isAvailable(): boolean {
    return !!this.groq;
  }

  public async generateIncidentAnalysis(
    incident: Incident,
    recalledMemories: SimilarIncidentMatch[],
    suggestedRunbook?: Runbook,
    memorySourceLabel: 'Demo Memory' | 'Hindsight Memory' = 'Hindsight Memory'
  ): Promise<AIIncidentAnalysis> {
    const topMatch = recalledMemories.length > 0 ? recalledMemories[0] : null;

    if (!this.groq) {
      console.log('[GroqService] Groq API key not set; using structured agent reasoning fallback.');
      return this.buildStructuredFallbackAnalysis(incident, recalledMemories, suggestedRunbook, memorySourceLabel);
    }

    try {
      console.log(`[GroqService] Calling Groq LLM (${this.model}) for incident analysis...`);

      const memoryContext = recalledMemories.map((m, idx) => `
[Historical Memory #${idx + 1}]
Incident ID: ${m.incident.incidentId}
Title: ${m.incident.title}
Service: ${m.incident.service}
Root Cause: ${m.incident.rootCause}
Resolution: ${m.incident.resolution}
What Worked: ${m.incident.whatWorked}
What Failed: ${m.incident.whatFailed || 'None'}
Runbook: ${m.incident.runbookUsed || 'N/A'}
Outcome: ${m.incident.outcome}
`).join('\n');

      const systemPrompt = `You are IncidentMind, an elite AI Incident Response Agent for SRE and DevOps teams.
Your task is to analyze an active production incident by reasoning dynamically over current telemetry and recalled organizational memories.

Do NOT assume any specific service, incident ID, or root cause unless it is explicitly present in the input telemetry or recalled memory.
If no past memories match, explicitly state that historical evidence is limited and provide diagnostic steps based on available telemetry.

Return a strictly valid JSON object matching this schema:
{
  "confirmedInformation": ["string"],
  "historicalInformation": ["string"],
  "aiAssessment": [
    { "hypothesis": "string", "likelihood": "High" | "Medium" | "Low", "reasoning": "string" }
  ],
  "recommendedInvestigation": ["string"],
  "whyThisRecommendation": {
    "explanation": "string (Synthesize why the recalled Hindsight memories support or do not support the current incident diagnosis)",
    "matchingFactors": [
      { "label": "string", "description": "string", "verified": boolean }
    ],
    "beforeVsAfterLearning": {
      "beforeGenericInvestigation": ["string"],
      "afterMemoryInformedInvestigation": ["string"]
    }
  },
  "recommendedResponse": {
    "summary": "string",
    "investigationSteps": ["string"]
  }
}
DO NOT wrap output in markdown fences. Output ONLY valid JSON.`;

      const userPrompt = `
CURRENT INCIDENT TELEMETRY:
ID: ${incident.id}
Title: ${incident.title}
Service: ${incident.service}
Severity: ${incident.severity}
Environment: ${incident.environment}
Symptoms: ${incident.symptoms}
Error Logs: ${incident.errorLogs || 'None provided'}
Additional Context: ${incident.additionalContext || 'None provided'}

RECALLED ORGANIZATIONAL MEMORIES FROM HINDSIGHT:
${memoryContext || 'No past incidents found in memory for this symptom profile.'}

SUGGESTED RUNBOOK:
Title: ${suggestedRunbook?.title || 'Standard Recovery Triage'}
Mitigation: ${suggestedRunbook?.mitigation.join('; ') || 'Standard operational investigation'}
`;

      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: this.model,
        temperature: 0.2,
        max_tokens: 1500
      });

      const rawContent = response.choices[0]?.message?.content?.trim() || '';
      console.log('[GroqService] Groq LLM response received successfully.');

      const jsonText = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(jsonText);

      return {
        incidentId: incident.id,
        confirmedInformation: parsed.confirmedInformation || [
          `Target Service: ${incident.service} (${incident.environment})`,
          `Severity Rating: ${incident.severity}`,
          `Observed Symptoms: ${incident.symptoms}`
        ],
        historicalInformation: parsed.historicalInformation || (topMatch ? [
          `Matched Incident: ${topMatch.incident.title} (${topMatch.incident.incidentId})`,
          `Historical Root Cause: ${topMatch.incident.rootCause}`,
          `Verified Resolution: ${topMatch.incident.resolution}`
        ] : ['No direct historical memories returned from Hindsight bank.']),
        aiAssessment: parsed.aiAssessment || [
          {
            hypothesis: topMatch ? `Primary Suspect: ${topMatch.incident.rootCause}` : `Service Degradation on ${incident.service}`,
            likelihood: 'High',
            reasoning: topMatch ? `Recalled memory ${topMatch.incident.incidentId} matches symptom profile.` : `Symptoms reported: "${incident.symptoms}".`
          }
        ],
        recommendedInvestigation: parsed.recommendedInvestigation || [
          `1. Inspect application logs and metric dashboards for ${incident.service}.`,
          `2. Verify network connectivity, error rates, and resource utilization.`,
          `3. Review recent deployments or configuration changes.`
        ],
        whyThisRecommendation: parsed.whyThisRecommendation || this.buildDefaultWhyRecommendation(incident, topMatch),
        similarIncidents: recalledMemories,
        memoryEvidence: recalledMemories.map((m) => ({
          historicalIncidentId: m.incident.incidentId,
          title: m.incident.title,
          service: m.incident.service,
          previousRootCause: m.incident.rootCause,
          previousResolution: m.incident.resolution,
          whatWorked: m.incident.whatWorked,
          whatFailed: m.incident.whatFailed,
          runbookUsed: m.incident.runbookUsed,
          outcome: m.incident.outcome,
          resolutionTimeMinutes: m.incident.resolutionTimeMinutes,
          source: memorySourceLabel
        })),
        recommendedResponse: {
          summary: parsed.recommendedResponse?.summary || (topMatch
            ? `Based on current symptoms and historical memory (${topMatch.incident.title}), investigate ${topMatch.incident.rootCause.toLowerCase()} first.`
            : `Follow standard diagnostic triage for ${incident.service}.`),
          investigationSteps: parsed.recommendedResponse?.investigationSteps || parsed.recommendedInvestigation || []
        },
        suggestedRunbook,
        memorySource: memorySourceLabel,
        humanConfirmationRequired: true
      };
    } catch (err: any) {
      console.error('[GroqService] Groq API call error:', err.message);
      return this.buildStructuredFallbackAnalysis(incident, recalledMemories, suggestedRunbook, memorySourceLabel);
    }
  }

  private buildDefaultWhyRecommendation(incident: Incident, topMatch: SimilarIncidentMatch | null): WhyThisRecommendation {
    return {
      explanation: topMatch
        ? `Recalled historical experience (${topMatch.incident.title}) on service "${topMatch.incident.service}" matches the symptom profile of the current incident. Primary recommendation: Verify historical root cause ("${topMatch.incident.rootCause}") before applying mitigation ("${topMatch.incident.resolution}").`
        : `No direct past incident experience was recalled from Hindsight memory for service "${incident.service}". Recommended investigation steps follow standard diagnostic triage based on observed symptoms: "${incident.symptoms}".`,
      matchingFactors: [
        {
          label: 'Service Domain Match',
          description: topMatch
            ? `Target service "${incident.service}" matches historical record (${topMatch.incident.service}).`
            : `Target service: "${incident.service}". No past incident record matched.`,
          verified: !!topMatch
        },
        {
          label: 'Symptom Profile Alignment',
          description: topMatch
            ? `Reported symptoms align with historical failure indicators.`
            : `Observed symptoms: "${incident.symptoms}".`,
          verified: !!topMatch
        },
        {
          label: 'Historical Root Cause Evidence',
          description: topMatch?.incident.rootCause || 'No past root cause evidence available in memory bank.',
          verified: !!topMatch
        },
        {
          label: 'Verified Historical Resolution',
          description: topMatch?.incident.resolution || 'Standard operational triage required.',
          verified: !!topMatch
        }
      ],
      beforeVsAfterLearning: {
        beforeGenericInvestigation: [
          '1. Inspect generic application logs',
          '2. Check recent deployments across all microservices',
          '3. Check general server health & load balancer metrics',
          '4. Restart application instances without root cause verification'
        ],
        afterMemoryInformedInvestigation: topMatch ? [
          `1. Check primary historical suspect: ${topMatch.incident.rootCause} (Proven fix in ${topMatch.incident.incidentId})`,
          `2. Verify service telemetry metrics before restarting nodes`,
          `3. Execute approved runbook: "${topMatch.incident.runbookUsed || 'Standard Triage'}"`,
          `4. Validate recovery SLA against post-mortem baseline`
        ] : [
          `1. Perform targeted diagnostics on service: ${incident.service}`,
          `2. Collect error traces and telemetry metrics`,
          `3. Follow standard operational recovery runbook`,
          `4. Store post-mortem in Hindsight upon resolution for future incident recall`
        ]
      }
    };
  }

  private buildStructuredFallbackAnalysis(
    incident: Incident,
    recalledMemories: SimilarIncidentMatch[],
    suggestedRunbook?: Runbook,
    memorySourceLabel: 'Demo Memory' | 'Hindsight Memory' = 'Hindsight Memory'
  ): AIIncidentAnalysis {
    const topMatch = recalledMemories.length > 0 ? recalledMemories[0] : null;

    return {
      incidentId: incident.id,
      confirmedInformation: [
        `Target Service: ${incident.service} (${incident.environment})`,
        `Severity Rating: ${incident.severity}`,
        `Observed Symptoms: ${incident.symptoms}`
      ],
      historicalInformation: topMatch
        ? [
            `Matched Incident: ${topMatch.incident.title} (${topMatch.incident.incidentId})`,
            `Historical Root Cause: ${topMatch.incident.rootCause}`,
            `Verified Resolution: ${topMatch.incident.resolution}`,
            `Resolution Outcome: ${topMatch.incident.outcome}`
          ]
        : [`No direct historical matches found in ${memorySourceLabel} for this symptom profile.`],
      aiAssessment: [
        {
          hypothesis: topMatch ? `Primary Suspect: ${topMatch.incident.rootCause}` : `Service Telemetry Degradation on ${incident.service}`,
          likelihood: 'High',
          reasoning: topMatch
            ? `Historical incident ${topMatch.incident.incidentId} (${topMatch.incident.title}) exhibited matching symptoms on ${topMatch.incident.service}. Concrete fix: "${topMatch.incident.resolution}".`
            : `Symptom profile indicates operational degradation on ${incident.service}: "${incident.symptoms}".`
        },
        {
          hypothesis: 'Secondary Suspect: Upstream / Dependency Timeout or Resource Constraint',
          likelihood: 'Medium',
          reasoning: `Telemetry indicates potential upstream dependency delay or resource limit on ${incident.service}.`
        }
      ],
      recommendedInvestigation: topMatch
        ? [
            `1. Investigate primary historical suspect on ${incident.service}: "${topMatch.incident.rootCause}".`,
            `2. Review telemetry metrics and active resource utilization.`,
            `3. Follow proven historical mitigation: "${topMatch.incident.whatWorked}".`,
            `4. Execute matching operational runbook: ${topMatch.incident.runbookUsed || suggestedRunbook?.title || 'Standard Recovery'}.`
          ]
        : [
            `1. Perform targeted diagnostics on ${incident.service} logs and metrics.`,
            `2. Check upstream and downstream service dependencies.`,
            `3. Verify resource consumption (CPU, memory, connection limits).`,
            `4. Execute operational runbook: ${suggestedRunbook?.title || 'Standard Recovery'}.`
          ],
      whyThisRecommendation: this.buildDefaultWhyRecommendation(incident, topMatch),
      similarIncidents: recalledMemories,
      memoryEvidence: recalledMemories.map((m) => ({
        historicalIncidentId: m.incident.incidentId,
        title: m.incident.title,
        service: m.incident.service,
        previousRootCause: m.incident.rootCause,
        previousResolution: m.incident.resolution,
        whatWorked: m.incident.whatWorked,
        whatFailed: m.incident.whatFailed,
        runbookUsed: m.incident.runbookUsed,
        outcome: m.incident.outcome,
        resolutionTimeMinutes: m.incident.resolutionTimeMinutes,
        source: memorySourceLabel
      })),
      recommendedResponse: {
        summary: topMatch
          ? `Based on current symptoms and relevant historical experience (${topMatch.incident.title}), investigate ${topMatch.incident.rootCause.toLowerCase()} first.`
          : `Follow standard diagnostic triage for ${incident.service}.`,
        investigationSteps: topMatch
          ? [
              `1. Check primary historical suspect on ${incident.service}: "${topMatch.incident.rootCause}".`,
              `2. Review service telemetry and connection limits.`,
              `3. Execute matching operational runbook: ${topMatch.incident.runbookUsed || suggestedRunbook?.title || 'Standard Recovery'}.`
            ]
          : [
              `1. Check error logs and telemetry metrics for ${incident.service}.`,
              `2. Verify service component health and dependencies.`,
              `3. Execute operational runbook: ${suggestedRunbook?.title || 'Standard Recovery'}.`
            ]
      },
      suggestedRunbook,
      memorySource: memorySourceLabel,
      humanConfirmationRequired: true
    };
  }
}
