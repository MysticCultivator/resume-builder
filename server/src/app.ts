// Load server/.env first, before anything else reads process.env. Kept as
// an explicit import here rather than relying on the route imports below
// to pull it in transitively (they eventually reach config/db.ts, which
// also loads it) — this file shouldn't depend on that import chain to get
// its own env vars (CLIENT_URL, below) loaded in time.
import './config/env';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import resumeItemsRoutes from './routes/resumeItems.routes';
import templateRoutes from './routes/template.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(
  cors({
    // CLIENT_URL is the Part 2 env var name; CLIENT_ORIGIN (Part 1) is kept
    // as a fallback so existing local setups keep working unchanged.
    origin: process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
// Required to read the HttpOnly auth cookie in requireAuth.
app.use(cookieParser());

// Part 2 moves the API surface from /api/v1 to /api to match the endpoints
// specified in the Part 2 requirements (e.g. POST /api/auth/register).
const API_PREFIX = '/api';

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/resumes`, resumeRoutes);
app.use(`${API_PREFIX}`, resumeItemsRoutes); // /education/:eduId, /experience/:expId, ...
app.use(`${API_PREFIX}/templates`, templateRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Must be registered last.
app.use(errorHandler);

export default app;
