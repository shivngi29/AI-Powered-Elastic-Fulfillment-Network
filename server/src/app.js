import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import nodeRoutes from './routes/nodeRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());
app.use('/api', healthRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
