import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';

const app = Fastify({ logger: true });
const prisma = new PrismaClient();

app.register(cors, { origin: true });
app.register(jwt, { secret: process.env.JWT_SECRET || 'dev_secret' });

// ── Middleware: verify JWT ────────────────────
app.decorate('authenticate', async (req: any, reply: any) => {
  try { await req.jwtVerify(); }
  catch { reply.status(401).send({ error: 'Unauthorized' }); }
});

// ── POST /register ────────────────────────────
app.post('/register', async (req: any, reply) => {
  const { name, email, password } = req.body as any;
  if (!name || !email || !password) return reply.status(400).send({ message: 'Все поля обязательны' });
  if (password.length < 6) return reply.status(400).send({ message: 'Пароль минимум 6 символов' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return reply.status(409).send({ message: 'Email уже используется' });

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '30d' });
  return reply.status(201).send({ token, user });
});

// ── POST /login ───────────────────────────────
app.post('/login', async (req: any, reply) => {
  const { email, password } = req.body as any;
  if (!email || !password) return reply.status(400).send({ message: 'Email и пароль обязательны' });

  // Demo account
  if (email === 'demo@lwb.app' && password === 'demo1234') {
    const token = app.jwt.sign({ id: 'demo', email }, { expiresIn: '30d' });
    return reply.send({ token, user: { id: 'demo', name: 'Demo User', email } });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return reply.status(401).send({ message: 'Неверный email или пароль' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return reply.status(401).send({ message: 'Неверный email или пароль' });

  const token = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '30d' });
  return reply.send({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// ── GET /me ───────────────────────────────────
app.get('/me', { preHandler: [(app as any).authenticate] }, async (req: any, reply) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) return reply.status(404).send({ message: 'Пользователь не найден' });
  return reply.send(user);
});

// ── PUT /me ───────────────────────────────────
app.put('/me', { preHandler: [(app as any).authenticate] }, async (req: any, reply) => {
  const { name } = req.body as any;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name },
    select: { id: true, name: true, email: true },
  });
  return reply.send(user);
});

// ── Health check ──────────────────────────────
app.get('/health', async () => ({ status: 'ok', service: 'auth', ts: new Date() }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT || 3001), host: '0.0.0.0' });
    console.log(`✅ Auth service on port ${process.env.PORT || 3001}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
