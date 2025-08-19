import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import { estimateRouter } from './routes/estimate.js';

const app = express();

// Enable JSON body parsing
app.use(express.json());

// Allow frontend origin
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// API routes
app.use('/api/estimate', estimateRouter);

app.listen(CONFIG.port, () => {
  console.log(`Backend listening on http://localhost:${CONFIG.port}`);
});
