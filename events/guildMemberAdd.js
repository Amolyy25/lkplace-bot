const { EmbedBuilder } = require('discord.js');
const { channels, colors } = require('../config');
const { send } = require('../utils/serverLog');
const { trackJoin, enableLockdown } = require('../utils/antiRaid');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    await send(member.guild, {
      title: 'membre arrivé',
      description: `<@${member.id}> a rejoint · tag : ${member.user.tag}`,
      color: colors.success,
    });

    const welcome = member.guild.channels.cache.get(channels.welcome);
    if (welcome) {
      const count = member.guild.memberCount;
      const embed = new EmbedBuilder()
        .setColor(colors.welcome)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setDescription(`bienvenue <@${member.id}>, grâce à toi nous sommes désormais ${count} membres !`);
      await welcome.send({ embeds: [embed] }).catch(() => {});
    }

    if (trackJoin()) {
      await enableLockdown(member.guild);
    }
  },
};
