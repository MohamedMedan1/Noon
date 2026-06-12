import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import sellerRequestRoutes from './routes/sellerRequestRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

const app = express();

// ─── Global Middlewares 
app.use(helmet());  
app.use(cors({ origin: process.env.CLIENT_URL || '*' })); 
app.use(express.json());

// ─── Routes
app.use('/api/v1/auth',            authRoutes);
app.use('/api/v1/admin',           adminRoutes);
app.use('/api/v1/users',           userRoutes);
app.use('/api/v1/sellers',         sellerRoutes);
app.use('/api/v1/seller-requests', sellerRequestRoutes);
app.use('/api/v1/cart',            cartRoutes);

// ─── 404 Handler
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'Fail',
    message: `Can't find ${req.originalUrl} on the server`,
  });
});

// ─── Global Error Handler 
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'Error';
  
  res.status(statusCode).json({
    status: status,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, error: err })
  });
});

export default app;