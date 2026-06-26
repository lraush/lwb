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

// GET /topics
app.get('/topics', auth, async (req: any) => {
  return prisma.topic.findMany({
    where: { userId: req.user.id },
    include: { steps: { orderBy: { order: 'asc' }, include: { sessions: { orderBy: { date: 'desc' }, take: 5 } } } },
    orderBy: { createdAt: 'desc' },
  });
});

// POST /topics
app.post('/topics', auth, async (req: any, reply) => {
  const { name, desc, category } = req.body as any;
  if (!name) return reply.status(400).send({ message: 'Название обязательно' });
  const topic = await prisma.topic.create({
    data: { name, desc: desc || '', category: category || 'other', userId: req.user.id },
    include: { steps: true },
  });
  return reply.status(201).send(topic);
});

// PUT /topics/:id
app.put('/topics/:id', auth, async (req: any, reply) => {
  const t = await prisma.topic.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!t) return reply.status(404).send({ message: 'Тема не найдена' });
  const { name, desc, category } = req.body as any;
  return prisma.topic.update({ where: { id: req.params.id }, data: { name, desc, category } });
});

// DELETE /topics/:id
app.delete('/topics/:id', auth, async (req: any, reply) => {
  const t = await prisma.topic.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!t) return reply.status(404).send({ message: 'Тема не найдена' });
  await prisma.topic.delete({ where: { id: req.params.id } });
  return reply.status(204).send();
});

// POST /topics/:id/steps
app.post('/topics/:topicId/steps', auth, async (req: any, reply) => {
  const t = await prisma.topic.findFirst({ where: { id: req.params.topicId, userId: req.user.id } });
  if (!t) return reply.status(404).send({ message: 'Тема не найдена' });
  const count = await prisma.step.count({ where: { topicId: req.params.topicId } });
  const { title, desc, hours } = req.body as any;
  const num = String(count + 1).padStart(2, '0');
  const step = await prisma.step.create({
    data: { title, desc: desc || '', hours: hours || 5, order: count, num, topicId: req.params.topicId },
  });
  return reply.status(201).send(step);
});

// PATCH /topics/:topicId/steps/:stepId
app.patch('/topics/:topicId/steps/:stepId', auth, async (req: any, reply) => {
  const topic = await prisma.topic.findFirst({ where: { id: req.params.topicId, userId: req.user.id } });
  if (!topic) return reply.status(403).send({ message: 'Нет доступа' });
  const { status, progress, title, desc } = req.body as any;
  const data: any = {};
  if (status !== undefined) data.status = status;
  if (progress !== undefined) data.progress = progress;
  if (status === 'done') data.progress = 100;
  if (title !== undefined) data.title = title;
  if (desc !== undefined) data.desc = desc;
  return prisma.step.update({ where: { id: req.params.stepId }, data });
});

// POST /topics/:topicId/steps/:stepId/sessions
app.post('/topics/:topicId/steps/:stepId/sessions', auth, async (req: any, reply) => {
  const topic = await prisma.topic.findFirst({ where: { id: req.params.topicId, userId: req.user.id } });
  if (!topic) return reply.status(403).send({ message: 'Нет доступа' });
  const { minutes, note } = req.body as any;
  const session = await prisma.session.create({
    data: { minutes: Number(minutes), note: note || '', stepId: req.params.stepId, date: new Date() },
  });
  // Auto-update progress
  const step = await prisma.step.findUnique({ where: { id: req.params.stepId } });
  if (step) {
    const totalMin = step.hours * 60;
    const allSessions = await prisma.session.findMany({ where: { stepId: req.params.stepId } });
    const doneMin = allSessions.reduce((s, ss) => s + ss.minutes, 0);
    const newProg = Math.min(100, Math.round((doneMin / totalMin) * 100));
    await prisma.step.update({ where: { id: req.params.stepId }, data: { progress: newProg, status: newProg >= 100 ? 'done' : 'in_progress' } });
  }
  return reply.status(201).send(session);
});

app.get('/health', async () => ({ status: 'ok', service: 'learning' }));
app.listen({ port: Number(process.env.PORT || 3005), host: '0.0.0.0' })
  .then(() => console.log('✅ Learning service ready'));
