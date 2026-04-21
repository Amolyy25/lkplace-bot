const { quotas } = require('../config');

const HOUR = 60 * 60 * 1000;
const buckets = new Map();

function check(userId, action) {
  const limit = quotas[action];
  if (!limit) return { ok: true, remaining: Infinity };

  const key = `${userId}:${action}`;
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.start >= HOUR) {
    buckets.set(key, { start: now, count: 1 });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    const resetIn = HOUR - (now - entry.start);
    return { ok: false, remaining: 0, resetIn };
  }

  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (now - v.start >= HOUR) buckets.delete(k);
  }
}, 10 * 60 * 1000).unref();

module.exports = { check };
