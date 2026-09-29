import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'IncidentMind Backend API',
    memoryProvider: process.env.MEMORY_PROVIDER || 'demo',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` 🚨 INCIDENTMIND BACKEND RUNNING ON PORT ${PORT}`);
  console.log(` 🧠 Memory Provider: ${process.env.MEMORY_PROVIDER || 'demo'} (Demo Memory)`);
  console.log(`====================================================`);
});
