const ID_RE = /^\d{17,20}$/;
const MENTION_RE = /^<@!?(\d{17,20})>$/;

function extractId(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (ID_RE.test(s)) return s;
  const m = s.match(MENTION_RE);
  return m ? m[1] : null;
}

async function resolveUser(client, input) {
  const id = extractId(input);
  if (!id) return null;
  const cached = client.users.cache.get(id);
  if (cached) return cached;
  try {
    return await client.users.fetch(id);
  } catch {
    return null;
  }
}

async function resolveMember(guild, input) {
  const id = extractId(input);
  if (!id) return null;
  const cached = guild.members.cache.get(id);
  if (cached) return cached;
  try {
    return await guild.members.fetch(id);
  } catch {
    return null;
  }
}

module.exports = { extractId, resolveUser, resolveMember };
