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

// ── HABITS ───────────────────────────────────
app.get('/habits', auth, async (req: any) => {
  return prisma.habit.findMany({ where: { userId: req.user.id }, include: { logs: { orderBy: { date: 'desc' }, take: 7 } } });
});

app.post('/habits', auth, async (req: any, reply) => {
  const { name, emoji, goalPerWeek } = req.body as any;
  if (!name) return reply.status(400).send({ message: 'Название обязательно' });
  const habit = await prisma.habit.create({
    data: { name, emoji: emoji||'⭐', goalPerWeek: goalPerWeek||7, userId: req.user.id },
  });
  return reply.status(201).send(habit);
});

app.post('/habits/:id/log', auth, async (req: any, reply) => {
  const habit = await prisma.habit.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!habit) return reply.status(404).send({ message: 'Привычка не найдена' });
  const today = new Date(); today.setHours(0,0,0,0);
  const exists = await prisma.habitLog.findFirst({ where: { habitId: req.params.id, date: { gte: today } } });
  if (exists) {
    await prisma.habitLog.delete({ where: { id: exists.id } });
    return { logged: false };
  }
  await prisma.habitLog.create({ data: { habitId: req.params.id, date: new Date() } });
  return { logged: true };
});

// ── MEDICATIONS ──────────────────────────────
app.get('/medications', auth, async (req: any) => {
  return prisma.medication.findMany({ where: { userId: req.user.id }, orderBy: { time: 'asc' } });
});

app.post('/medications', auth, async (req: any, reply) => {
  const { name, dose, time, notes } = req.body as any;
  if (!name || !dose) return reply.status(400).send({ message: 'Название и доза обязательны' });
  const med = await prisma.medication.create({ data: { name, dose, time: time||'Утром', notes: notes||'', userId: req.user.id } });
  return reply.status(201).send(med);
});

app.patch('/medications/:id/taken', auth, async (req: any, reply) => {
  const m = await prisma.medication.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!m) return reply.status(404).send({ message: 'Не найдено' });
  return prisma.medication.update({ where: { id: req.params.id }, data: { takenToday: !m.takenToday } });
});

// ── WATER ────────────────────────────────────
app.get('/water/today', auth, async (req: any) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const logs = await prisma.waterLog.findMany({ where: { userId: req.user.id, date: { gte: today } } });
  const total = logs.reduce((s, l) => s + l.ml, 0);
  return { total, goal: 2000, percentage: Math.min(100, Math.round((total/2000)*100)), logs };
});

app.post('/water', auth, async (req: any, reply) => {
  const { ml } = req.body as any;
  const log = await prisma.waterLog.create({ data: { ml: Number(ml)||250, userId: req.user.id, date: new Date() } });
  return reply.status(201).send(log);
});

app.get('/health', async () => ({ status: 'ok', service: 'health' }));
app.listen({ port: Number(process.env.PORT || 3006), host: '0.0.0.0' })
  .then(() => console.log('✅ Health service ready'));
