import { Incident, MemoryItem, Runbook } from '../types/incident';

export const INITIAL_RUNBOOKS: Runbook[] = [
  {
    id: 'rb-db-conn-pool',
    title: 'Database Connection Exhaustion',
    service: 'Payment API',
    symptoms: [
      'High 503 response rates on service endpoints',
      'Database connection timeout errors in application logs',
      'Connection pool utilization reaching 100%'
    ],
    detection: 'Monitor connection pool metrics in Grafana; alert triggers when pool saturation exceeds 90% for 3 consecutive minutes.',
    verification: 'Check active connections count via db admin console and verify if background pool threads are blocked waiting for connections.',
    mitigation: [
      'Increase max_connections parameter dynamically or bump application connection pool limit.',
      'Identify and terminate long-running idle transactions blocking connection release.',
      'Gracefully restart affected service nodes to reset connection pools.'
    ],
    validation: 'Verify API 503 error rates drop back to 0% and connection pool utilization settles below 60%.',
    escalation: 'Escalate to Database Infrastructure Team if connection count remains saturated after pool expansion.'
  },
  {
    id: 'rb-auth-credential',
    title: 'Authentication Credential Failure',
    service: 'Authentication Service',
    symptoms: [
      'Global auth failures with HTTP 401/403 across microservices',
      'JWT signing/verification key validation errors in server logs',
      'Third-party OAuth token refresh rejections'
    ],
    detection: 'Alert triggers when auth failure rate exceeds 5% of total request volume.',
    verification: 'Check certificate expiration dates and verify secret rotation timestamps in secret manager.',
    mitigation: [
      'Rotate signing keys/credentials in Vault or Secrets Manager.',
      'Trigger credential cache invalidation across auth proxy nodes.',
      'Perform a rolling restart of Authentication Service instances.'
    ],
    validation: 'Perform test token generation and verify downstream service request validation succeeds.',
    escalation: 'Escalate to Security Operations if credential store access fails or unauthorized rotation is suspected.'
  },
  {
    id: 'rb-api-latency',
    title: 'API Latency Investigation',
    service: 'Order API',
    symptoms: [
      'Elevated response latency (p95 > 2500ms, p99 > 5000ms)',
      'Upstream gateway timeout HTTP 504 errors',
      'High CPU or database read queue lock contention'
    ],
    detection: 'APM latency alarm triggers when p95 response time exceeds 2000ms.',
    verification: 'Review distributed tracing spans in APM to pinpoint slow database queries or downstream HTTP dependency calls.',
    mitigation: [
      'Enable read-replica query routing for expensive read queries.',
      'Apply temporary query cache rules or indexes for unindexed search queries.',
      'Rate-limit high-volume non-critical API consumer clients.'
    ],
    validation: 'Confirm p95 latency returns under 300ms SLA target.',
    escalation: 'Escalate to Lead Backend Engineer if latency is caused by unoptimizable core query schema changes.'
  },
  {
    id: 'rb-service-recovery',
    title: 'Service Availability Recovery',
    service: 'Web Application',
    symptoms: [
      'Container crash loops or out-of-memory (OOM) kills',
      'Load balancer reporting unhealthy backend instance health checks',
      'Intermittent HTTP 502/504 errors'
    ],
    detection: 'Synthetic availability uptime monitor fails 3 consecutive pings.',
    verification: 'Inspect container memory metrics and check dmesg / container events for OOM killed processes.',
    mitigation: [
      'Increase instance replica count via container orchestrator.',
      'Restart unhealthy pod instances and drain traffic from degraded nodes.',
      'Temporarily disable memory-heavy background cron tasks.'
    ],
    validation: 'Verify target group health checks return all nodes healthy and synthetic ping succeeds.',
    escalation: 'Escalate to Platform Engineering if node pool autoscaler fails to provision new instances.'
  }
];

export const INITIAL_HISTORICAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-001',
    incidentId: 'INC-001',
    title: 'Payment API 503 Spike (Pattern A: DB Pool Saturation)',
    service: 'Payment API',
    severity: 'SEV-1',
    environment: 'Production',
    symptoms: 'High volume of 503 responses, elevated latency, and DB connection pool utilization at 100%.',
    rootCause: 'Database connection pool exhaustion due to traffic burst and unreleased idle connections.',
    resolution: 'Increased connection pool capacity from 50 to 150 connections and restarted affected service nodes.',
    whatWorked: 'Increasing the connection pool size and restarting the affected service immediately freed connection slots.',
    whatFailed: 'Attempting a simple service restart without increasing pool limits caused connection pool exhaustion to re-occur within 2 minutes.',
    runbookUsed: 'Database Connection Exhaustion',
    outcome: 'Resolved successfully in 8 minutes.',
    resolutionTimeMinutes: 8,
    date: '2026-08-14',
    source: 'Demo Memory'
  },
  {
    id: 'mem-006',
    incidentId: 'INC-006',
    title: 'Payment API Timeout (Pattern B: External Provider Timeout)',
    service: 'Payment API',
    severity: 'SEV-2',
    environment: 'Production',
    symptoms: 'High volume of 503 responses and high gateway latency, but DB connection pool utilization was normal (22%).',
    rootCause: 'External Stripe payment gateway upstream latency timeout resulting in socket exhaustion.',
    resolution: 'Enabled automated failover circuit breaker to switch payment processing to fallback Adyen gateway.',
    whatWorked: 'Circuit breaker gateway failover restored checkout success immediately without database changes.',
    whatFailed: 'Restarting database or payment pods did not improve external API timeouts.',
    runbookUsed: 'API Latency Investigation',
    outcome: 'Resolved successfully in 11 minutes.',
    resolutionTimeMinutes: 11,
    date: '2026-08-28',
    source: 'Demo Memory'
  },
  {
    id: 'mem-002',
    incidentId: 'INC-002',
    title: 'Order API Latency Spike',
    service: 'Order API',
    severity: 'SEV-2',
    environment: 'Production',
    symptoms: 'API response time increased significantly with p99 latency spiking over 4500ms during peak hours.',
    rootCause: 'Database query saturation caused by an unindexed JOIN between orders and item history tables.',
    resolution: 'Identified expensive query execution plan and applied an optimized index on (order_id, created_at).',
    whatWorked: 'Query plan optimization and adding partial database index immediately lowered CPU load.',
    whatFailed: 'Scaling out web server instances did not help as the bottleneck was strictly database lock saturation.',
    runbookUsed: 'API Latency Investigation',
    outcome: 'Resolved successfully in 15 minutes.',
    resolutionTimeMinutes: 15,
    date: '2026-08-22',
    source: 'Demo Memory'
  },
  {
    id: 'mem-003',
    incidentId: 'INC-003',
    title: 'Authentication Service Outage',
    service: 'Authentication Service',
    severity: 'SEV-1',
    environment: 'Production',
    symptoms: 'Users unable to authenticate. Microservices rejecting JWT bearer tokens with 401 Unauthorized.',
    rootCause: 'Expired service credential and failed automated TLS signing key rotation script.',
    resolution: 'Manual credential rotation in secret store followed by auth service restart and key cache flush.',
    whatWorked: 'Immediate manual credential rotation and clearing cached public keys across API gateways.',
    whatFailed: 'Waiting for automated cron rotation script failed because the key daemon had hung.',
    runbookUsed: 'Authentication Credential Failure',
    outcome: 'Resolved successfully in 12 minutes.',
    resolutionTimeMinutes: 12,
    date: '2026-09-02',
    source: 'Demo Memory'
  },
  {
    id: 'mem-004',
    incidentId: 'INC-004',
    title: 'Website Availability Issue',
    service: 'Web Application',
    severity: 'SEV-2',
    environment: 'Production',
    symptoms: 'Website became intermittently unavailable showing 504 Gateway Timeout errors.',
    rootCause: 'Application server resource exhaustion caused by memory leak in session handler under load.',
    resolution: 'Scaled application instances from 4 to 10 nodes and restarted degraded node instances.',
    whatWorked: 'Horizontal scaling and replacing degraded container instances restored traffic routing.',
    whatFailed: 'Clearing CDN edge cache did not resolve origin gateway timeouts.',
    runbookUsed: 'Service Availability Recovery',
    outcome: 'Resolved successfully in 20 minutes.',
    resolutionTimeMinutes: 20,
    date: '2026-09-10',
    source: 'Demo Memory'
  },
  {
    id: 'mem-005',
    incidentId: 'INC-005',
    title: 'Notification Delivery Failure',
    service: 'Notification Service',
    severity: 'SEV-2',
    environment: 'Production',
    symptoms: 'Large number of delayed notifications; background email and SMS dispatch queue backup.',
    rootCause: 'Message queue backlog resulting from downstream third-party SMS gateway rate limiting.',
    resolution: 'Scaled worker instances, activated retry backoff queues, and drained queue backlog safely.',
    whatWorked: 'Worker scaling combined with dead-letter retry queues allowed steady processing.',
    whatFailed: 'Flushing the queue without rate limiting overwhelmed the third-party API again.',
    runbookUsed: 'API Latency Investigation',
    outcome: 'Resolved successfully in 25 minutes.',
    resolutionTimeMinutes: 25,
    date: '2026-09-18',
    source: 'Demo Memory'
  }
];

export const INITIAL_INCIDENTS: Incident[] = INITIAL_HISTORICAL_MEMORIES.map((mem) => ({
  id: mem.incidentId,
  title: mem.title,
  service: mem.service,
  severity: mem.severity,
  environment: mem.environment,
  status: 'Resolved',
  symptoms: mem.symptoms,
  errorLogs: `[ERROR] ${mem.service} - ${mem.symptoms}`,
  createdAt: `${mem.date}T10:00:00.000Z`,
  updatedAt: `${mem.date}T10:${mem.resolutionTimeMinutes}:00.000Z`,
  actualRootCause: mem.rootCause,
  resolutionSteps: mem.resolution,
  whatWorked: mem.whatWorked,
  whatFailed: mem.whatFailed,
  runbookUsed: mem.runbookUsed,
  resolutionTimeMinutes: mem.resolutionTimeMinutes,
  postMortemNotes: `Post-mortem completed for ${mem.title}. Lessons learned ingested into Demo Memory.`,
  resolvedAt: `${mem.date}T10:${mem.resolutionTimeMinutes}:00.000Z`
}));
