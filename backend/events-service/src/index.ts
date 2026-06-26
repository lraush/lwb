import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';

const app = Fastify({ logger: true });
const prisma = new PrismaClient();
app.register(cors, { origin: true });
app.register(jwt, { secret: process.env.JWT_SECRET || 'dev_secret' });
app.decorate('authenticate', async (req: any, reply: any) => {
  try { await req.jwtVerify(); } catch { reply.status(401).send({ error: 'Unauthorized' }); }
});
const auth = { preHandler: [(app as any).authenticate] };

// ── SPORTS / WORKOUTS ────────────────────────
app.get('/workouts', auth, async (req: any) => {
  return prisma.workout.findMany({ where: { userId: req.user.id }, orderBy: { date: 'desc' }, take: 20 });
});

app.post('/workouts', auth, async (req: any, reply) => {
  const { type, duration, distance, calories, notes, date } = req.body as any;
  if (!type || !duration) return reply.status(400).send({ message: 'type и duration обязательны' });
  const workout = await prisma.workout.create({
    data: { type, duration: Number(duration), distance: distance||'—', calories: Number(calories)||0,
            notes: notes||'', date: date ? new Date(date) : new Date(), userId: req.user.id },
  });
  return reply.status(201).send(workout);
});

// ── TRAVEL ───────────────────────────────────
app.get('/trips', auth, async (req: any) => {
  return prisma.trip.findMany({ where: { userId: req.user.id }, orderBy: { travelDate: 'asc' } });
});

app.post('/trips', auth, async (req: any, reply) => {
  const { destination, emoji, travelDate, budget, status, notes } = req.body as any;
  if (!destination) return reply.status(400).send({ message: 'Направление обязательно' });
  const trip = await prisma.trip.create({
    data: { destination, emoji: emoji||'✈️', travelDate: travelDate ? new Date(travelDate) : null,
            budget: Number(budget)||0, status: status||'planned', notes: notes||'', userId: req.user.id },
  });
  return reply.status(201).send(trip);
});

// ── MEDIA ────────────────────────────────────
app.get('/media', auth, async (req: any) => {
  const { type, status } = req.query as any;
  const where: any = { userId: req.user.id };
  if (type)   where.type = type;
  if (status) where.status = status;
  return prisma.mediaItem.findMany({ where, orderBy: { createdAt: 'desc' } });
});

app.post('/media', auth, async (req: any, reply) => {
  const { type, title, author, year, status } = req.body as any;
  if (!title) return reply.status(400).send({ message: 'Название обязательно' });
  const item = await prisma.mediaItem.create({
    data: { type: type||'book', title, author: author||'', year: year ? Number(year) : null,
            status: status||'wishlist', userId: req.user.id },
  });
  return reply.status(201).send(item);
});

app.patch('/media/:id', auth, async (req: any, reply) => {
  const m = await prisma.mediaItem.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!m) return reply.status(404).send({ message: 'Не найдено' });
  const { status, rating } = req.body as any;
  return prisma.mediaItem.update({ where: { id: req.params.id },
    data: { ...(status&&{status}), ...(rating!==undefined&&{rating:Number(rating)}) } });
});

app.get('/health', async () => ({ status: 'ok', service: 'events' }));
app.listen({ port: Number(process.env.PORT || 3007), host: '0.0.0.0' })
  .then(() => console.log('✅ Events service ready'));
