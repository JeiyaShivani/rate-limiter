const WINDOW_SIZE_MS = 60 * 1000; // 60 seconds

const LIMITS = {
  user: 100,
  ip: 500
};

async function isAllowed(redis, key, limit) {
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE_MS;

  const multi = redis.multi();
  multi.zremrangebyscore(key, 0, windowStart);
  multi.zcard(key);
  multi.zadd(key, now, `${now}-${Math.random()}`);
  multi.expire(key, 60);
  const results = await multi.exec();

  const requestCount = results[1][1];
  
  if (requestCount < limit) {
    return {
      allowed: true,
      remaining: limit - requestCount - 1,
      resetIn: Math.ceil(WINDOW_SIZE_MS / 1000)
    };
  } else {
    // remove the entry we just added since request is rejected
    await redis.zremrangebyscore(key, now, now);
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil(WINDOW_SIZE_MS / 1000)
    };
  }
}

module.exports = { isAllowed, LIMITS };
