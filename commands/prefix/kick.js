const { isStaff } = require('../../utils/permissions');
const { resolveMember } = require('../../utils/parseUser');
const { error, neutral } = require('../../utils/embed');
const { fetchRepliedMessage } = require('../../utils/actions');
const { buildReasonRow } = require('../../utils/reasonSelect');
const pendingMod = require('../../utils/pendingMod');

module.exports = {
  name: 'kick',
  async execute(message, args) {
    if (!isStaff(message.member)) {
      return message.reply({ embeds: [error('Accès refusé', 'Réservé au staff')] });
    }
    const member = await resolveMember(message.guild, args.shift());
    if (!member) return message.reply({ embeds: [error('Cible invalide', 'Membre introuvable')] });

    const replied = await fetchRepliedMessage(message);
    pendingMod.set(message.id, {
      action: 'kick',
      targetId: member.id,
      moderatorId: message.author.id,
      extraReason: args.join(' ') || null,
      repliedContent: replied?.content?.slice(0, 200) || null,
    });

    await message.reply({
      embeds: [neutral('Kick · Choix de la raison', `Cible : <@${member.id}>`)],
      components: [buildReasonRow(message.id)],
    });
  },
};
