import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes.js';
import { errorHandler } from './shared/middlewares/error.middleware.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy' });
});

// Error handling
app.use(errorHandler);

export default app;
