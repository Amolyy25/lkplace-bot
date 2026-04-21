const { fetchRepliedMessage, composeReason } = require('./actions');

function parseDurationToMs(input) {
  if (!input) return null;
  const m = String(input).match(/^(\d+)\s*(s|m|h|d|j)?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  const u = (m[2] || 'm').toLowerCase();
  const mult = u === 's' ? 1000
    : u === 'm' ? 60_000
    : u === 'h' ? 3_600_000
    : 86_400_000;
  return n * mult;
}

async function buildReasonFromMessage(message, reasonArgs) {
  const replied = await fetchRepliedMessage(message);
  return composeReason(reasonArgs.join(' '), replied);
}

module.exports = { parseDurationToMs, buildReasonFromMessage };
