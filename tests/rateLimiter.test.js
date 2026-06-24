const Redis = require('ioredis');
const { isAllowed, LIMITS } = require('../src/rateLimiter');

const redis = new Redis({ host: 'localhost', port: 6379 });

afterAll(async () => {
  await redis.quit();
});

beforeEach(async () => {
  await redis.flushall();
});

test('allows requests under the limit', async () => {
  const result = await isAllowed(redis, 'user:test1', 5);
  expect(result.allowed).toBe(true);
  expect(result.remaining).toBe(4);
});

test('blocks requests over the limit', async () => {
  for (let i = 0; i < 5; i++) {
    await isAllowed(redis, 'user:test2', 5);
  }
  const result = await isAllowed(redis, 'user:test2', 5);
  expect(result.allowed).toBe(false);
  expect(result.remaining).toBe(0);
});

test('remaining decrements correctly', async () => {
  await isAllowed(redis, 'user:test3', 5);
  await isAllowed(redis, 'user:test3', 5);
  const result = await isAllowed(redis, 'user:test3', 5);
  expect(result.remaining).toBe(2);
});

test('LIMITS object has correct values', () => {
  expect(LIMITS.user).toBe(100);
  expect(LIMITS.ip).toBe(500);
});
