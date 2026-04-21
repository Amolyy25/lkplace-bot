const { EmbedBuilder } = require('discord.js');
const { channels, colors } = require('../config');
const { send } = require('../utils/serverLog');
const { trackJoin, enableLockdown } = require('../utils/antiRaid');
const { detectInviter, recordJoin } = require('../utils/inviteTracker');
const { sendJoinPings } = require('../utils/ghostping');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const inviterP = detectInviter(member).catch(() => null);
    const joinPingP = sendJoinPings(member).catch(err => console.error('[joinPing]', err.message));
    const raidP = (async () => {
      if (trackJoin()) await enableLockdown(member.guild).catch(() => {});
    })();

    const used = await inviterP;
    const inviterLine = used?.inviter ? ` · invité par <@${used.inviter.id}>` : '';

    const recordP = recordJoin(member, used).catch(err => console.error('[recordJoin]', err.message));

    const auditP = send(member.guild, {
      title: 'membre arrivé',
      description: `<@${member.id}> a rejoint · tag : ${member.user.tag}${inviterLine}`,
      color: colors.success,
    }).catch(() => {});

    let welcomeP = Promise.resolve();
    const welcome = member.guild.channels.cache.get(channels.welcome);
    if (welcome) {
      const count = member.guild.memberCount;
      const lines = [`bienvenue <@${member.id}>, grâce à toi nous sommes désormais ${count} membres !`];
      if (used?.inviter) lines.push(`invité par <@${used.inviter.id}>`);
      const embed = new EmbedBuilder()
        .setColor(colors.welcome)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setDescription(lines.join('\n'));
      welcomeP = welcome.send({ embeds: [embed] }).catch(() => {});
    }

    await Promise.allSettled([joinPingP, raidP, recordP, auditP, welcomeP]);
  },
};
