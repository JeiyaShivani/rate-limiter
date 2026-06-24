const express = require('express');
const Redis = require('ioredis');

const app = express();
app.use(express.json());

const redis = new Redis({
  host: 'localhost',
  port: 6379
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});
const checkRouter = require('./routes/check');
app.use('/', checkRouter);
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = { app, redis };
