const { PermissionFlagsBits } = require('discord.js');
const { prefix, colors, channels: chans } = require('../config');
const { trackMessage } = require('../utils/antiRaid');
const { doMute, doBan } = require('../utils/modCore');
const { error } = require('../utils/embed');
const { EmbedBuilder } = require('discord.js');
const { handleMessage } = require('../utils/levels');

const INVITE_RE = /(discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\/)/i;
const BIO_SPAM_RE = /^[^\w]*#\s*check\s*my\s*bio/i;

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;
    await handleMessage(message);

    const member = message.member;
    const canBypass = member?.permissions?.has(PermissionFlagsBits.ManageGuild)
      || member?.permissions?.has(PermissionFlagsBits.Administrator);

    if (!canBypass) {
      const content = message.content || '';
      
      // Anti-invite
      if (INVITE_RE.test(content)) {
        await message.delete().catch(() => {});
        try {
          await doBan(message.guild, { targetUser: message.author, reason: 'anti-invite automatique', moderator: client.user });
        } catch {}
        const logChannel = message.guild.channels.cache.get(chans.modLogs);
        if (logChannel) {
          const e = new EmbedBuilder()
            .setColor(colors.error)
            .setTitle('invitation bloquée')
            .setDescription(`auteur : <@${message.author.id}> · action : ban automatique\n> ${content.slice(0, 300)}`);
          await logChannel.send({ embeds: [e] }).catch(() => {});
        }
        return;
      }

      // Anti-"Check my bio" raid
      if (BIO_SPAM_RE.test(content)) {
        await message.delete().catch(() => {});
        try {
          await doMute(message.guild, {
            targetMember: member,
            reason: 'anti-raid : spam "# Check my bio"',
            durationMs: 12 * 60 * 60 * 1000,
            durationLabel: '12h',
            moderator: client.user,
          });

          const logChannel = message.guild.channels.cache.get(chans.modLogs);
          if (logChannel) {
            const e = new EmbedBuilder()
              .setColor(colors.error)
              .setTitle('spam "check my bio" bloqué')
              .setDescription(`auteur : <@${message.author.id}> · action : mute 12h\n> ${content.slice(0, 300)}`);
            await logChannel.send({ embeds: [e] }).catch(() => {});
          }
        } catch {}
        return;
      }

      const spam = trackMessage(message);
      if (spam?.spam && member) {
        try {
          await doMute(message.guild, {
            targetMember: member,
            reason: 'anti-spam automatique',
            durationMs: 10 * 60 * 1000,
            durationLabel: '10 min',
            moderator: client.user,
          });
        } catch {}
      }
    }

    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const name = args.shift()?.toLowerCase();
    if (!name) return;

    const cmd = client.prefixCommands.get(name);
    if (!cmd) return;
    message.channel.sendTyping().catch(() => {});
    try {
      await cmd.execute(message, args, client);
    } catch (err) {
      console.error('prefix cmd error:', err);
      await message.reply({ embeds: [error('erreur', 'une erreur est survenue')] }).catch(() => {});
    }
  },
};
