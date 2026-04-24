const { EmbedBuilder } = require('discord.js');
const { channels, colors, roles } = require('../config');
const { send } = require('../utils/serverLog');
const { trackJoin, enableLockdown } = require('../utils/antiRaid');
const { detectInviter, recordJoin } = require('../utils/inviteTracker');
const { sendJoinPings } = require('../utils/ghostping');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const autoRoleP = member.roles.add(roles.member).catch(err => console.error('[autoRole]', err.message));
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
      const inviterText = used?.inviter ? `\ninvité par **${used.inviter.tag}**` : '';
      
      const embed = new EmbedBuilder()
        .setColor(colors.welcome)
        .setAuthor({ name: 'Nouvelle Arrivée', iconURL: member.guild.iconURL() })
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setTitle(`Bienvenue sur Lkplace, ${member.user.username}`)
        .setDescription(`Ravis de te compter parmi nous. Grâce à toi, nous sommes désormais **${count}** membres dans la communauté.${inviterText}\n\nN'oublie pas de prendre tes rôles et de passer un bon moment !`)
        .setTimestamp();
        
      welcomeP = welcome.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
    }

    await Promise.allSettled([autoRoleP, joinPingP, raidP, recordP, auditP, welcomeP]);
  },
};
