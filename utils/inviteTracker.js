const db = require('./db');

const cache = new Map();

async function primeCache(guild) {
  try {
    const invites = await guild.invites.fetch();
    const map = new Map();
    for (const inv of invites.values()) map.set(inv.code, inv.uses);
    if (guild.vanityURLCode) {
      try {
        const vanity = await guild.fetchVanityData();
        map.set(`__vanity:${guild.vanityURLCode}`, vanity.uses);
      } catch {}
    }
    cache.set(guild.id, map);
    return true;
  } catch {
    return false;
  }
}

function addInvite(guild, code, uses) {
  const map = cache.get(guild.id) || new Map();
  map.set(code, uses);
  cache.set(guild.id, map);
}

function removeInvite(guild, code) {
  const map = cache.get(guild.id);
  if (map) map.delete(code);
}

async function detectInviter(member) {
  const guild = member.guild;
  const cached = cache.get(guild.id) || new Map();

  let current;
  try {
    current = await guild.invites.fetch();
  } catch {
    return null;
  }

  let used = null;
  for (const inv of current.values()) {
    const prev = cached.get(inv.code) ?? 0;
    if (inv.uses > prev) { used = inv; break; }
  }

  const next = new Map();
  for (const inv of current.values()) next.set(inv.code, inv.uses);
  if (guild.vanityURLCode) {
    try {
      const vanity = await guild.fetchVanityData();
      next.set(`__vanity:${guild.vanityURLCode}`, vanity.uses);
    } catch {}
  }
  cache.set(guild.id, next);

  return used ? { code: used.code, inviter: used.inviter } : null;
}

async function recordJoin(member, used) {
  if (!db.available()) return;
  await db.query(
    `INSERT INTO invite_tracking (invitee_id, invitee_tag, inviter_id, inviter_tag, invite_code)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      member.id,
      member.user?.tag || null,
      used?.inviter?.id || null,
      used?.inviter?.tag || null,
      used?.code || null,
    ]
  );
}

async function recordLeave(memberId) {
  if (!db.available()) return;
  await db.query(
    `UPDATE invite_tracking
     SET still_present = FALSE, left_at = NOW()
     WHERE invitee_id = $1 AND still_present = TRUE`,
    [memberId]
  );
}

async function countFor(userId) {
  if (!db.available()) return null;
  const res = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE still_present = TRUE)::int AS active,
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE still_present = FALSE)::int AS left
     FROM invite_tracking WHERE inviter_id = $1`,
    [userId]
  );
  return res.rows[0] || { active: 0, total: 0, left: 0 };
}

module.exports = {
  primeCache, addInvite, removeInvite,
  detectInviter, recordJoin, recordLeave, countFor,
};
