const db = require('./db');

const TYPE_LABEL = {
  ban: 'ban', kick: 'kick', mute: 'mute', warn: 'warn',
  unmute: 'unmute', unban: 'unban',
};

async function listForUser(targetId, limit = 10) {
  if (!db.available()) return null;
  const res = await db.query(
    `SELECT id, type, reason, duration_label, created_at, active
     FROM sanctions WHERE target_id = $1
     ORDER BY id DESC LIMIT $2`,
    [targetId, limit]
  );
  return res.rows;
}

async function countForUser(targetId) {
  if (!db.available()) return null;
  const res = await db.query(
    `SELECT type, COUNT(*)::int AS n FROM sanctions WHERE target_id = $1 GROUP BY type`,
    [targetId]
  );
  return res.rows;
}

async function getCase(id) {
  if (!db.available()) return null;
  const res = await db.query(`SELECT * FROM sanctions WHERE id = $1`, [id]);
  return res.rows[0] || null;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

module.exports = { listForUser, countForUser, getCase, formatDate, TYPE_LABEL };
