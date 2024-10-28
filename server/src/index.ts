import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { patientRouter } from './routes/patients';
import { referralRouter } from './routes/referrals';
import { settingsRouter } from './routes/settings';
import { logger } from './utils/logger';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-netlify-app.netlify.app']
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/patients', patientRouter);
app.use('/api/referrals', referralRouter);
app.use('/api/settings', settingsRouter);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing HTTP server and database connections');
  await prisma.$disconnect();
  process.exit(0);
});