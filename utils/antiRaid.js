const { antiSpam, antiRaid, channels: chans } = require('../config');
const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { colors } = require('../config');

const spamMap = new Map();
const joinTimestamps = [];
const state = { lockdown: false };

function trackMessage(message) {
  if (!message.guild || message.author.bot) return null;
  const key = `${message.author.id}:${message.channel.id}`;
  const now = Date.now();
  const entry = spamMap.get(key) || [];
  const recent = entry.filter(t => now - t < antiSpam.windowMs);
  recent.push(now);
  spamMap.set(key, recent);
  if (recent.length >= antiSpam.messages) {
    spamMap.delete(key);
    return { spam: true };
  }
  return null;
}

function trackJoin() {
  const now = Date.now();
  while (joinTimestamps.length && now - joinTimestamps[0] > antiRaid.windowMs) {
    joinTimestamps.shift();
  }
  joinTimestamps.push(now);
  return joinTimestamps.length >= antiRaid.joins;
}

async function enableLockdown(guild) {
  if (state.lockdown) return false;
  state.lockdown = true;

  const everyone = guild.roles.everyone;
  for (const channel of guild.channels.cache.values()) {
    if (channel.type !== ChannelType.GuildText) continue;
    try {
      await channel.permissionOverwrites.edit(everyone, { SendMessages: false });
    } catch {}
  }

  const logChannel = guild.channels.cache.get(chans.modLogs);
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setColor(colors.error)
      .setTitle('lockdown activé')
      .setDescription('raid détecté · envoi bloqué pour @everyone');
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  }
  return true;
}

async function disableLockdown(guild) {
  if (!state.lockdown) return false;
  state.lockdown = false;

  const everyone = guild.roles.everyone;
  for (const channel of guild.channels.cache.values()) {
    if (channel.type !== ChannelType.GuildText) continue;
    try {
      await channel.permissionOverwrites.edit(everyone, { SendMessages: null });
    } catch {}
  }

  const logChannel = guild.channels.cache.get(chans.modLogs);
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setColor(colors.success)
      .setTitle('lockdown désactivé')
      .setDescription('envoi restauré pour @everyone');
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  }
  return true;
}

module.exports = { trackMessage, trackJoin, enableLockdown, disableLockdown, state };
