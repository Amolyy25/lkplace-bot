const { AuditLogEvent } = require('discord.js');

async function fetchExecutor(guild, type, targetId) {
  try {
    const logs = await guild.fetchAuditLogs({ type, limit: 5 });
    const entry = logs.entries.find(e => {
      if (!e.target) return false;
      if (targetId && e.target.id !== targetId) return false;
      return Date.now() - e.createdTimestamp < 10_000;
    });
    return entry?.executor || null;
  } catch {
    return null;
  }
}

module.exports = { fetchExecutor, AuditLogEvent };
