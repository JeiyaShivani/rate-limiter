const express = require('express');
const router = express.Router();
const { isAllowed, LIMITS } = require('../rateLimiter');

router.post('/check', async (req, res) => {
  const { userId, ip } = req.body;

  if (!userId || !ip) {
    return res.status(400).json({ error: 'userId and ip are required' });
  }

  const userKey = `user:${userId}`;
  const ipKey = `ip:${ip}`;

  const { redis } = require('../app');

  const userResult = await isAllowed(redis, userKey, LIMITS.user);
  if (!userResult.allowed) {
    return res.status(429).json({
      allowed: false,
      remaining: 0,
      resetIn: userResult.resetIn,
      reason: 'user limit exceeded'
    });
  }

  const ipResult = await isAllowed(redis, ipKey, LIMITS.ip);
  if (!ipResult.allowed) {
    return res.status(429).json({
      allowed: false,
      remaining: 0,
      resetIn: ipResult.resetIn,
      reason: 'ip limit exceeded'
    });
  }

  return res.json({
    allowed: true,
    remaining: Math.min(userResult.remaining, ipResult.remaining),
    resetIn: userResult.resetIn
  });
});

module.exports = router;
