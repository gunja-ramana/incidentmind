import 'dotenv/config';
import { HindsightClient } from '@vectorize-io/hindsight-client';

async function runDirectRecallTest() {
  const apiKey = process.env.HINDSIGHT_API_KEY;
  const baseUrl = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';
  const bankId = process.env.HINDSIGHT_BANK_ID || 'incidentmind';

  if (!apiKey) {
    console.error('API Key Missing');
    process.exit(1);
  }

  const client = new HindsightClient({ baseUrl, apiKey });
  const query = "Find previous incidents related to Payment API 503 errors, database connection pool saturation, and traffic spikes.";

  try {
    const startTime = Date.now();
    // Execute recall request using official Hindsight SDK
    const recallResult: any = await client.recall(bankId, query, { budget: 'mid' });
    const duration = Date.now() - startTime;

    const resultsList = recallResult?.results || recallResult?.memories || recallResult?.chunks || [];
    const count = Array.isArray(resultsList) ? resultsList.length : 0;

    const summaryList: string[] = [];
    if (Array.isArray(resultsList)) {
      resultsList.slice(0, 3).forEach((item: any, idx: number) => {
        const text = item.content || item.text || item.summary || JSON.stringify(item);
        const snippet = text.replace(/\s+/g, ' ').slice(0, 140);
        summaryList.push(`Memory #${idx + 1}: ${snippet}...`);
      });
    }

    console.log(JSON.stringify({
      httpStatus: 200,
      authentication: 'PASS',
      bankAccess: 'PASS',
      recallRequest: 'PASS',
      count,
      durationMs: duration,
      summary: summaryList,
      error: null
    }, null, 2));

  } catch (err: any) {
    console.log(JSON.stringify({
      httpStatus: err.status || err.statusCode || 500,
      authentication: err.status === 401 ? 'FAIL' : 'PASS',
      bankAccess: err.status === 404 ? 'FAIL' : 'PASS',
      recallRequest: 'FAIL',
      count: 0,
      error: err.message || String(err)
    }, null, 2));
  }
}

runDirectRecallTest();
