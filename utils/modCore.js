const { colors } = require('../config');
const {
  recordSanction, markSanctionInactive, logModAction,
  dmUser, buildSanctionDm,
} = require('./actions');

async function doBan(guild, { targetUser, reason, moderator, silent = false }) {
  if (!silent && targetUser) {
    await dmUser(targetUser, buildSanctionDm('banni', reason));
  }
  await guild.bans.create(targetUser.id, { reason: reason || 'non spécifiée', deleteMessageSeconds: 0 });
  const caseId = await recordSanction({ type: 'ban', target: targetUser, moderator, reason });
  logModAction(guild, { type: 'membre banni', target: targetUser, reason, caseId, color: colors.error });
  return { caseId };
}

async function doKick(guild, { targetMember, reason, moderator }) {
  await dmUser(targetMember.user, buildSanctionDm('exclu', reason));
  await targetMember.kick(reason || 'non spécifiée');
  const caseId = await recordSanction({ type: 'kick', target: targetMember.user, moderator, reason });
  logModAction(guild, { type: 'membre exclu', target: targetMember.user, reason, caseId, color: colors.error });
  return { caseId };
}

async function doMute(guild, { targetMember, reason, durationMs, durationLabel, moderator }) {
  const dmP = dmUser(targetMember.user, buildSanctionDm('réduit au silence', reason, durationLabel));
  const timeoutP = targetMember.timeout(durationMs, reason || 'non spécifiée');
  await Promise.all([dmP, timeoutP]);
  const caseId = await recordSanction({
    type: 'mute', target: targetMember.user, moderator, reason, durationMs, durationLabel,
  });
  logModAction(guild, {
    type: 'membre mute', target: targetMember.user, reason, duration: durationLabel, caseId, color: colors.warning,
  });
  return { caseId };
}

async function doUnmute(guild, { targetMember, reason, moderator }) {
  const dmP = dmUser(targetMember.user, buildSanctionDm('unmute', reason));
  const timeoutP = targetMember.timeout(null, reason || 'non spécifiée');
  await Promise.all([dmP, timeoutP]);
  await markSanctionInactive(targetMember.id, 'mute');
  const caseId = await recordSanction({ type: 'unmute', target: targetMember.user, moderator, reason });
  logModAction(guild, {
    type: 'membre unmute', target: targetMember.user, reason, caseId, color: colors.success,
  });
  return { caseId };
}

async function doWarn(guild, { targetUser, reason, moderator }) {
  await dmUser(targetUser, buildSanctionDm('avertissement', reason));
  const caseId = await recordSanction({ type: 'warn', target: targetUser, moderator, reason });
  logModAction(guild, { type: 'avertissement', target: targetUser, reason, caseId, color: colors.warning });
  return { caseId };
}

async function doClear(channel, amount) {
  const messages = await channel.bulkDelete(amount, true);
  return messages.size;
}

async function doUnban(guild, { targetId, reason, moderator }) {
  await guild.bans.remove(targetId, reason || 'non spécifiée');
  await markSanctionInactive(targetId, 'ban');
  const user = await guild.client.users.fetch(targetId).catch(() => null);
  const caseId = await recordSanction({ type: 'unban', target: user || { id: targetId }, moderator, reason });
  if (user) {
    logModAction(guild, { type: 'membre débanni', target: user, reason, caseId, color: colors.success });
  }
  return { caseId };
}

module.exports = { doBan, doKick, doMute, doUnmute, doWarn, doClear, doUnban };
