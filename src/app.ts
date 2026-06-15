import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';



const app = express();

// ─── Global Middlewares 
app.use(helmet());  
app.use(cors({ origin: process.env.CLIENT_URL || '*' })); 
app.use(express.json());



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