const { isAdmin } = require('../../utils/permissions');
const { resolveMember } = require('../../utils/parseUser');
const { doMute } = require('../../utils/modCore');
const { error, success, caseFooter } = require('../../utils/embed');

module.exports = {
  name: 'mmute',
  async execute(message, args) {
    if (!isAdmin(message.member)) return message.reply({ embeds: [error('accès refusé', 'réservé aux admins')] });
    const member = await resolveMember(message.guild, args.shift());
    if (!member) return message.reply({ embeds: [error('cible invalide', 'membre introuvable')] });
    try {
      const { caseId } = await doMute(message.guild, {
        targetMember: member, reason: 'mmute (admin)', durationMs: 24 * 60 * 60 * 1000, durationLabel: '24h', moderator: message.author,
      });
      await message.reply({ embeds: [success('membre mute', `<@${member.id}> · 24h`).setFooter({ text: caseFooter(caseId) })] });
    } catch (e) {
      await message.reply({ embeds: [error('échec', e.message)] });
    }
  },
};
