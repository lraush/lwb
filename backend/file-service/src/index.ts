import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import path from 'path';

const app = Fastify({ logger: true });
app.register(cors, { origin: true });
app.register(jwt, { secret: process.env.JWT_SECRET || 'dev_secret' });
app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB
app.decorate('authenticate', async (req: any, reply: any) => {
  try { await req.jwtVerify(); } catch { reply.status(401).send({ error: 'Unauthorized' }); }
});
const auth = { preHandler: [(app as any).authenticate] };

const BUCKET = 'lwb-files';

const minio = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

// Init bucket
const initBucket = async () => {
  try {
    const exists = await minio.bucketExists(BUCKET);
    if (!exists) {
      await minio.makeBucket(BUCKET, 'us-east-1');
      await minio.setBucketPolicy(BUCKET, JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${BUCKET}/*`] }],
      }));
      console.log(`✅ Bucket ${BUCKET} created`);
    }
  } catch (e) { console.error('MinIO init error:', e); }
};

// POST /upload
app.post('/upload', auth, async (req: any, reply) => {
  const data = await req.file();
  if (!data) return reply.status(400).send({ message: 'Файл не найден' });

  const ext = path.extname(data.filename);
  const key = `${req.user.id}/${randomUUID()}${ext}`;
  const buf = await data.toBuffer();

  await minio.putObject(BUCKET, key, buf, buf.length, { 'Content-Type': data.mimetype });

  const url = await minio.presignedGetObject(BUCKET, key, 7 * 24 * 3600);
  return reply.status(201).send({
    key, url,
    filename: data.filename,
    size: buf.length,
    mimetype: data.mimetype,
  });
});

// GET /files
app.get('/files', auth, async (req: any) => {
  return new Promise((resolve, reject) => {
    const stream = minio.listObjects(BUCKET, `${req.user.id}/`, true);
    const files: any[] = [];
    stream.on('data', obj => files.push({ key: obj.name, size: obj.size, lastModified: obj.lastModified }));
    stream.on('end', () => resolve(files));
    stream.on('error', reject);
  });
});

// DELETE /files
app.delete('/files', auth, async (req: any, reply) => {
  const { key } = req.body as any;
  if (!key?.startsWith(req.user.id)) return reply.status(403).send({ message: 'Нет доступа' });
  await minio.removeObject(BUCKET, key);
  return reply.status(204).send();
});

// GET /presign — short-lived download URL
app.get('/presign', auth, async (req: any, reply) => {
  const { key } = req.query as any;
  if (!key?.startsWith(req.user.id)) return reply.status(403).send({ message: 'Нет доступа' });
  const url = await minio.presignedGetObject(BUCKET, key, 3600);
  return { url };
});

app.get('/health', async () => ({ status: 'ok', service: 'files' }));

const start = async () => {
  await initBucket();
  await app.listen({ port: Number(process.env.PORT || 3008), host: '0.0.0.0' });
  console.log('✅ File service ready');
};
start();
