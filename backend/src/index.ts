import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import { estimateRouter } from './routes/estimate.js';

const app = express();
app.use(cors());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/estimate', estimateRouter);

app.listen(CONFIG.port, () => {
  console.log(`Backend listening on http://localhost:${CONFIG.port}`);
});
