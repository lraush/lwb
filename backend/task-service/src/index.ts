import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';

const app = Fastify({ logger: true });
const prisma = new PrismaClient();

app.register(cors, { origin: true });
app.register(jwt, { secret: process.env.JWT_SECRET || 'dev_secret' });

app.decorate('authenticate', async (req: any, reply: any) => {
  try { await req.jwtVerify(); }
  catch { reply.status(401).send({ error: 'Unauthorized' }); }
});

const auth = { preHandler: [(app as any).authenticate] };

// ── GET /stats ────────────────────────────────
app.get('/stats', auth, async (req: any) => {
  const userId = req.user.id;
  const [total, done, inProgress, overdue] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: 'done' } }),
    prisma.task.count({ where: { userId, status: 'in_progress' } }),
    prisma.task.count({ where: { userId, status: { not: 'done' }, dueDate: { lt: new Date() } } }),
  ]);
  return { total, done, inProgress, overdue };
});

// ── GET / ─────────────────────────────────────
app.get('/', auth, async (req: any) => {
  const { status, priority, category } = req.query as any;
  const where: any = { userId: req.user.id };
  if (status)   where.status = status;
  if (priority) where.priority = priority;
  if (category) where.category = category;
  return prisma.task.findMany({ where, orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] });
});

// ── POST / ────────────────────────────────────
app.post('/', auth, async (req: any, reply) => {
  const { title, description, priority, status, category, dueDate, tags } = req.body as any;
  if (!title) return reply.status(400).send({ message: 'Название обязательно' });
  const task = await prisma.task.create({
    data: {
      title, description, priority: priority || 'medium',
      status: status || 'todo', category: category || '',
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
      userId: req.user.id,
    },
  });
  return reply.status(201).send(task);
});

// ── GET /:id ──────────────────────────────────
app.get('/:id', auth, async (req: any, reply) => {
  const task = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!task) return reply.status(404).send({ message: 'Задача не найдена' });
  return task;
});

// ── PATCH /:id ────────────────────────────────
app.patch('/:id', auth, async (req: any, reply) => {
  const exists = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!exists) return reply.status(404).send({ message: 'Задача не найдена' });
  const { title, description, priority, status, category, dueDate, tags } = req.body as any;
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...(title       !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority    !== undefined && { priority }),
      ...(status      !== undefined && { status }),
      ...(category    !== undefined && { category }),
      ...(dueDate     !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(tags        !== undefined && { tags }),
    },
  });
  return task;
});

// ── DELETE /:id ───────────────────────────────
app.delete('/:id', auth, async (req: any, reply) => {
  const exists = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!exists) return reply.status(404).send({ message: 'Задача не найдена' });
  await prisma.task.delete({ where: { id: req.params.id } });
  return reply.status(204).send();
});

// ── Health ────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', service: 'tasks', ts: new Date() }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT || 3002), host: '0.0.0.0' });
    console.log(`✅ Task service on port ${process.env.PORT || 3002}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
