const TTL = 5 * 60 * 1000;
const pending = new Map();

function set(id, data) {
  pending.set(id, { ...data, ts: Date.now() });
}

function get(id) {
  const entry = pending.get(id);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL) {
    pending.delete(id);
    return null;
  }
  return entry;
}

function del(id) {
  pending.delete(id);
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of pending) if (now - v.ts > TTL) pending.delete(k);
}, 60_000).unref();

module.exports = { set, get, del };
