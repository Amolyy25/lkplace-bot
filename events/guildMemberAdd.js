const { EmbedBuilder } = require('discord.js');
const { channels, colors } = require('../config');
const { send } = require('../utils/serverLog');
const { trackJoin, enableLockdown } = require('../utils/antiRaid');
const { detectInviter, recordJoin } = require('../utils/inviteTracker');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const used = await detectInviter(member);
    await recordJoin(member, used);

    const inviterLine = used?.inviter ? ` · invité par <@${used.inviter.id}>` : '';

    await send(member.guild, {
      title: 'membre arrivé',
      description: `<@${member.id}> a rejoint · tag : ${member.user.tag}${inviterLine}`,
      color: colors.success,
    });

    const welcome = member.guild.channels.cache.get(channels.welcome);
    if (welcome) {
      const count = member.guild.memberCount;
      const lines = [`bienvenue <@${member.id}>, grâce à toi nous sommes désormais ${count} membres !`];
      if (used?.inviter) lines.push(`invité par <@${used.inviter.id}>`);
      const embed = new EmbedBuilder()
        .setColor(colors.welcome)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setDescription(lines.join('\n'));
      await welcome.send({ embeds: [embed] }).catch(() => {});
    }

    if (trackJoin()) {
      await enableLockdown(member.guild);
    }
  },
};
