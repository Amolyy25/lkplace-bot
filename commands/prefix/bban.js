const { isAdmin } = require('../../utils/permissions');
const { resolveUser } = require('../../utils/parseUser');
const { doBan } = require('../../utils/modCore');
const { error, success, caseFooter } = require('../../utils/embed');

module.exports = {
  name: 'bban',
  async execute(message, args) {
    if (!isAdmin(message.member)) return message.reply({ embeds: [error('accès refusé', 'réservé aux admins')] });
    const user = await resolveUser(message.client, args.shift());
    if (!user) return message.reply({ embeds: [error('cible invalide', 'mention ou ID incorrect')] });
    try {
      const { caseId } = await doBan(message.guild, { targetUser: user, reason: 'bban (admin)', silent: true, moderator: message.author });
      await message.reply({ embeds: [success('membre banni', `<@${user.id}>`).setFooter({ text: caseFooter(caseId) })] });
    } catch (e) {
      await message.reply({ embeds: [error('échec', e.message)] });
    }
  },
};
