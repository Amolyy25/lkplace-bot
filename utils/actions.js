const { EmbedBuilder } = require('discord.js');
const { channels, colors } = require('../config');
const { error, success } = require('./embed');
const db = require('./db');

let memCounter = 0;

async function recordSanction({ type, target, moderator, reason, durationMs, durationLabel }) {
  if (!db.available()) return ++memCounter;
  const res = await db.query(
    `INSERT INTO sanctions (type, target_id, target_tag, moderator_id, moderator_tag, reason, duration_ms, duration_label)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      type,
      target?.id || null,
      target?.tag || null,
      moderator?.id || null,
      moderator?.tag || null,
      reason || null,
      durationMs || null,
      durationLabel || null,
    ]
  );
  return res?.rows?.[0]?.id ?? ++memCounter;
}

async function markSanctionInactive(targetId, type) {
  if (!db.available()) return;
  await db.query(
    `UPDATE sanctions SET active = FALSE WHERE target_id = $1 AND type = $2 AND active = TRUE`,
    [targetId, type]
  );
}

function fmtTime(d = new Date()) {
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

async function dmUser(user, embed) {
  try {
    await user.send({ embeds: [embed] });
    return true;
  } catch {
    return false;
  }
}

function logModAction(guild, { type, target, reason, duration, caseId, color }) {
  const channel = guild.channels.cache.get(channels.modLogs);
  if (!channel) return Promise.resolve();

  const embed = new EmbedBuilder()
    .setColor(color ?? colors.error)
    .setTitle(type)
    .setDescription(`<@${target.id}> · raison : ${reason || 'non spécifiée'}`)
    .setFooter({ text: `cas #${caseId} · ${fmtTime()}` });

  if (duration) embed.addFields({ name: 'durée', value: duration, inline: true });

  return channel.send({ embeds: [embed] }).catch(() => {});
}

function buildSanctionDm(action, reason, duration) {
  const e = new EmbedBuilder()
    .setColor(colors.error)
    .setTitle(action)
    .setDescription(`raison : ${reason || 'non spécifiée'}`);
  if (duration) e.addFields({ name: 'durée', value: duration, inline: true });
  return e;
}

async function fetchRepliedMessage(message) {
  if (!message?.reference?.messageId) return null;
  try {
    return await message.channel.messages.fetch(message.reference.messageId);
  } catch {
    return null;
  }
}

function composeReason(baseReason, repliedMessage) {
  const parts = [];
  if (baseReason) parts.push(baseReason);
  if (repliedMessage?.content) {
    const snippet = repliedMessage.content.length > 200
      ? repliedMessage.content.slice(0, 200) + '…'
      : repliedMessage.content;
    parts.push(`(message : "${snippet}")`);
  }
  return parts.join(' ').trim() || 'non spécifiée';
}

module.exports = {
  recordSanction, markSanctionInactive,
  fmtTime, dmUser, logModAction,
  buildSanctionDm, fetchRepliedMessage, composeReason,
  errorEmbed: error, successEmbed: success,
};
