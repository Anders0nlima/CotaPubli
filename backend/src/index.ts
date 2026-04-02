import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import transactionRoutes from './routes/transactions.routes';
import webhookRoutes from './routes/webhook.routes';
import materialsRoutes from './routes/materials.routes';
import cardsRoutes from './routes/cards.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = process.env.PORT ?? 4000;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
}));

// JSON body parsing (webhook route uses its own express.raw — must be registered first)
app.use('/api/webhook', webhookRoutes);

// JSON body for all other routes
app.use(express.json());

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`🚀 CotaPubli API running on http://localhost:${PORT}`);
});

export default app;
