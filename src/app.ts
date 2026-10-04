import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env.js';
import { badgeRoute } from './routes/badge.js';
import { homeRoute } from './routes/home.js';
import { themesRoute } from './routes/themes.js';

export const app = new Hono<{ Bindings: Env }>();

// Badges are embedded everywhere, so any origin may fetch them.
app.use('*', cors());

app.get('/', homeRoute);
app.get('/themes', themesRoute);
// Must stay last: it matches every single-segment path and only answers those starting with "@".
app.get('/:handle', badgeRoute);
