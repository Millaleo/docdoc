import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { requestId } from './middleware/requestId.js';
import authRoutes from './routes/auth.js';
import familyRoutes from './routes/family.js';
import planRoutes from './routes/plans.js';
import chatRoutes from './routes/chat.js';
import ticketRoutes from './routes/tickets.js';
import documentRoutes from './routes/documents.js';
import adminRoutes from './routes/admin.js';
import { openApiDocument } from './openapi.js';
import './types.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(requestId);
app.use(morgan(':method :url :status :response-time ms reqId=:req[x-request-id]'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'docdoc-backend' }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/auth', authLimiter, authRoutes);
app.use('/family', familyRoutes);
app.use('/', planRoutes);
app.use('/chat', chatRoutes);
app.use('/', ticketRoutes);
app.use('/', documentRoutes);
app.use('/admin', adminRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(JSON.stringify({ level: 'error', message: err.message, stack: err.stack }));
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.port, () => {
  console.log(JSON.stringify({ level: 'info', message: `API running on port ${env.port}` }));
});
