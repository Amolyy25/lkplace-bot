const { isStaff } = require('../../utils/permissions');
const { resolveMember } = require('../../utils/parseUser');
const { error, neutral } = require('../../utils/embed');
const { fetchRepliedMessage } = require('../../utils/actions');
const { buildReasonRow } = require('../../utils/reasonSelect');
const { parseDurationToMs } = require('../../utils/prefixHelpers');
const pendingMod = require('../../utils/pendingMod');

module.exports = {
  name: 'mute',
  async execute(message, args) {
    if (!isStaff(message.member)) {
      return message.reply({ embeds: [error('accès refusé', 'réservé au staff')] });
    }
    const member = await resolveMember(message.guild, args.shift());
    if (!member) return message.reply({ embeds: [error('cible invalide', 'membre introuvable')] });

    const durationArg = args.shift();
    const ms = parseDurationToMs(durationArg);
    if (!ms) return message.reply({ embeds: [error('durée invalide', 'format : 10m, 1h, 7j')] });

    const replied = await fetchRepliedMessage(message);
    pendingMod.set(message.id, {
      action: 'mute',
      targetId: member.id,
      moderatorId: message.author.id,
      durationMs: ms,
      durationLabel: durationArg,
      extraReason: args.join(' ') || null,
      repliedContent: replied?.content?.slice(0, 200) || null,
    });

    await message.reply({
      embeds: [neutral('mute · choix de la raison', `cible : <@${member.id}> · durée : ${durationArg}`)],
      components: [buildReasonRow(message.id)],
    });
  },
};
