const { isStaff } = require('../../utils/permissions');
const { resolveUser } = require('../../utils/parseUser');
const { error, neutral } = require('../../utils/embed');
const { fetchRepliedMessage } = require('../../utils/actions');
const { buildReasonRow } = require('../../utils/reasonSelect');
const pendingMod = require('../../utils/pendingMod');

module.exports = {
  name: 'warn',
  async execute(message, args) {
    if (!isStaff(message.member)) {
      return message.reply({ embeds: [error('accès refusé', 'réservé au staff')] });
    }
    const user = await resolveUser(message.client, args.shift());
    if (!user) return message.reply({ embeds: [error('cible invalide', 'mention ou ID incorrect')] });

    const replied = await fetchRepliedMessage(message);
    pendingMod.set(message.id, {
      action: 'warn',
      targetId: user.id,
      moderatorId: message.author.id,
      extraReason: args.join(' ') || null,
      repliedContent: replied?.content?.slice(0, 200) || null,
    });

    await message.reply({
      embeds: [neutral('warn · choix de la raison', `cible : <@${user.id}>`)],
      components: [buildReasonRow(message.id)],
    });
  },
};
