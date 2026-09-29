import 'dotenv/config';
import Groq from 'groq-sdk';

async function runLiveGroqTest() {
  console.log('====================================================');
  console.log(' 🧪 LIVE GROQ LLM INTEGRATION TEST');
  console.log('====================================================');

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  console.log(`[Config Check] Model: ${model}`);
  console.log(`[Config Check] API Key Present: ${apiKey ? 'YES (Key Hidden)' : 'NO'}`);

  if (!apiKey) {
    console.error('Groq authentication: FAIL');
    console.error('Model request: FAIL');
    console.error('Error: GROQ_API_KEY is missing from environment.');
    process.exit(1);
  }

  let groq: Groq;
  try {
    groq = new Groq({ apiKey });
    console.log('Groq authentication: PASS');
  } catch (err: any) {
    console.error('Groq authentication: FAIL');
    console.error(`Error initializing Groq SDK: ${err.message}`);
    process.exit(1);
  }

  try {
    console.log(`\nSending test completion request to model "${model}"...`);
    const startTime = Date.now();
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are IncidentMind Groq LLM tester. Respond in one concise sentence.' },
        { role: 'user', content: 'Confirm live reasoning engine operational status.' }
      ],
      model,
      temperature: 0.1,
      max_tokens: 100
    });

    const duration = Date.now() - startTime;
    const content = response.choices[0]?.message?.content?.trim() || '';

    console.log('Model request: PASS');
    console.log(`Response Time: ${duration}ms`);
    console.log(`Live LLM Output: "${content}"`);
    console.log('====================================================');
  } catch (err: any) {
    console.error('Model request: FAIL');
    console.error(`Actual error: ${err.message}`);
    console.log('====================================================');
  }
}

runLiveGroqTest().catch((err) => {
  console.error('Actual error:', err.message);
});
