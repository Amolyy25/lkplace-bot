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
      return message.reply({ embeds: [error('Accès refusé', 'Réservé au staff')] });
    }
    const user = await resolveUser(message.client, args.shift());
    if (!user) return message.reply({ embeds: [error('Cible invalide', 'Mention ou ID incorrect')] });

    const replied = await fetchRepliedMessage(message);
    pendingMod.set(message.id, {
      action: 'warn',
      targetId: user.id,
      moderatorId: message.author.id,
      extraReason: args.join(' ') || null,
      repliedContent: replied?.content?.slice(0, 200) || null,
    });

    await message.reply({
      embeds: [neutral('Warn · Choix de la raison', `Cible : <@${user.id}>`)],
      components: [buildReasonRow(message.id)],
    });
  },
};
