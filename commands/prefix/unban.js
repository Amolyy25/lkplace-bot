const { isStaff } = require('../../utils/permissions');
const { extractId } = require('../../utils/parseUser');
const { doUnban } = require('../../utils/modCore');
const { error, success, caseFooter } = require('../../utils/embed');
const { buildReasonFromMessage } = require('../../utils/prefixHelpers');

module.exports = {
  name: 'unban',
  async execute(message, args) {
    if (!isStaff(message.member)) return message.reply({ embeds: [error('accès refusé', 'réservé au staff')] });
    const id = extractId(args.shift());
    if (!id) return message.reply({ embeds: [error('cible invalide', 'ID incorrect')] });
    const reason = await buildReasonFromMessage(message, args);
    try {
      const { caseId } = await doUnban(message.guild, { targetId: id, reason, moderator: message.author });
      await message.reply({ embeds: [success('membre débanni', `<@${id}> · raison : ${reason}`).setFooter({ text: caseFooter(caseId) })] });
    } catch (e) {
      await message.reply({ embeds: [error('échec', e.message)] });
    }
  },
};
