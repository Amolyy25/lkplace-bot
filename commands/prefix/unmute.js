const { isStaff } = require('../../utils/permissions');
const { resolveMember } = require('../../utils/parseUser');
const { doUnmute } = require('../../utils/modCore');
const { error, success, caseFooter } = require('../../utils/embed');
const { buildReasonFromMessage } = require('../../utils/prefixHelpers');

module.exports = {
  name: 'unmute',
  async execute(message, args) {
    if (!isStaff(message.member)) return message.reply({ embeds: [error('accès refusé', 'réservé au staff')] });
    const member = await resolveMember(message.guild, args.shift());
    if (!member) return message.reply({ embeds: [error('cible invalide', 'membre introuvable')] });
    const reason = await buildReasonFromMessage(message, args);
    try {
      const { caseId } = await doUnmute(message.guild, { targetMember: member, reason, moderator: message.author });
      await message.reply({ embeds: [success('membre unmute', `<@${member.id}>`).setFooter({ text: caseFooter(caseId) })] });
    } catch (e) {
      await message.reply({ embeds: [error('échec', e.message)] });
    }
  },
};
