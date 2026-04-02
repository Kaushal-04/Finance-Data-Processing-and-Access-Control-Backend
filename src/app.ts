import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', routes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: (err as any).errors.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
    });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default app;
