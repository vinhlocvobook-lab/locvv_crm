import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/product/product.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import quoteRoutes from './modules/quote/quote.routes.js';
import supplierRoutes from './modules/supplier/supplier.routes.js';
import userRoutes from './modules/user/user.routes.js';
import roleRoutes from './modules/role/role.routes.js';
import categoryRoutes from './modules/product/category.routes.js';
import manufacturerRoutes from './modules/product/manufacturer.routes.js';
import { errorHandler } from './shared/middlewares/error.middleware.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/manufacturers', manufacturerRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy' });
});

// Error handling
app.use(errorHandler);

export default app;
