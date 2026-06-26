import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import { startOfMonth, endOfMonth } from 'date-fns';

const app = Fastify({ logger: true });
const prisma = new PrismaClient();
app.register(cors, { origin: true });
app.register(jwt, { secret: process.env.JWT_SECRET || 'dev_secret' });
app.decorate('authenticate', async (req: any, reply: any) => {
  try { await req.jwtVerify(); } catch { reply.status(401).send({ error: 'Unauthorized' }); }
});
const auth = { preHandler: [(app as any).authenticate] };

// GET /summary
app.get('/summary', auth, async (req: any) => {
  const userId = req.user.id;
  const now = new Date();
  const txns = await prisma.transaction.findMany({
    where: { userId, date: { gte: startOfMonth(now), lte: endOfMonth(now) } },
  });
  const income   = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance  = income - expenses;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
  return { income, expenses, balance, savingsRate, txnCount: txns.length };
});

// GET /transactions
app.get('/transactions', auth, async (req: any) => {
  const { type, limit = 50, offset = 0 } = req.query as any;
  const where: any = { userId: req.user.id };
  if (type) where.type = type;
  return prisma.transaction.findMany({
    where, orderBy: { date: 'desc' },
    take: Number(limit), skip: Number(offset),
  });
});

// POST /transactions
app.post('/transactions', auth, async (req: any, reply) => {
  const { type, category, amount, description, date } = req.body as any;
  if (!type || !category || !amount) return reply.status(400).send({ message: 'type, category, amount обязательны' });
  const txn = await prisma.transaction.create({
    data: { type, category, amount: Number(amount), description: description || '', date: date ? new Date(date) : new Date(), userId: req.user.id },
  });
  return reply.status(201).send(txn);
});

// DELETE /transactions/:id
app.delete('/transactions/:id', auth, async (req: any, reply) => {
  const t = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!t) return reply.status(404).send({ message: 'Не найдено' });
  await prisma.transaction.delete({ where: { id: req.params.id } });
  return reply.status(204).send();
});

// GET /monthly — for charts
app.get('/monthly', auth, async (req: any) => {
  const userId = req.user.id;
  const months = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    const start = startOfMonth(d);
    const end   = endOfMonth(d);
    const txns  = await prisma.transaction.findMany({ where: { userId, date: { gte: start, lte: end } } });
    const income   = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    months.push({ month: start.toLocaleDateString('ru', { month: 'short' }), income, expenses });
  }
  return months;
});

app.get('/health', async () => ({ status: 'ok', service: 'finance' }));

app.listen({ port: Number(process.env.PORT || 3004), host: '0.0.0.0' })
  .then(() => console.log('✅ Finance service ready'));
