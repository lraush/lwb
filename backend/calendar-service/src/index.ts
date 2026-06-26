// Calendar Service - Port 3003
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

// GET /events
app.get('/events', auth, async (req: any) => {
  const { from, to } = req.query as any;
  const where: any = { userId: req.user.id };
  if (from) where.startAt = { gte: new Date(from) };
  if (to)   where.endAt   = { lte: new Date(to) };
  return prisma.event.findMany({ where, orderBy: { startAt: 'asc' } });
});

// POST /events
app.post('/events', auth, async (req: any, reply) => {
  const { title, description, startAt, endAt, color, allDay } = req.body as any;
  if (!title || !startAt) return reply.status(400).send({ message: 'title и startAt обязательны' });
  const event = await prisma.event.create({
    data: { title, description: description||'', startAt: new Date(startAt),
            endAt: endAt ? new Date(endAt) : new Date(startAt),
            color: color||'#7c6af7', allDay: allDay||false, userId: req.user.id },
  });
  return reply.status(201).send(event);
});

// PATCH /events/:id
app.patch('/events/:id', auth, async (req: any, reply) => {
  const e = await prisma.event.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!e) return reply.status(404).send({ message: 'Не найдено' });
  const { title, description, startAt, endAt, color } = req.body as any;
  return prisma.event.update({ where: { id: req.params.id },
    data: { ...(title&&{title}), ...(description!==undefined&&{description}),
            ...(startAt&&{startAt:new Date(startAt)}), ...(endAt&&{endAt:new Date(endAt)}), ...(color&&{color}) } });
});

// DELETE /events/:id
app.delete('/events/:id', auth, async (req: any, reply) => {
  const e = await prisma.event.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!e) return reply.status(404).send({ message: 'Не найдено' });
  await prisma.event.delete({ where: { id: req.params.id } });
  return reply.status(204).send();
});

// GET /upcoming
app.get('/upcoming', auth, async (req: any) => {
  return prisma.event.findMany({
    where: { userId: req.user.id, startAt: { gte: new Date() } },
    orderBy: { startAt: 'asc' }, take: 10,
  });
});

app.get('/health', async () => ({ status: 'ok', service: 'calendar' }));
app.listen({ port: Number(process.env.PORT || 3003), host: '0.0.0.0' })
  .then(() => console.log('✅ Calendar service ready'));
