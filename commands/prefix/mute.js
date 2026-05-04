const { isStaff } = require('../../utils/permissions');
const { resolveMember } = require('../../utils/parseUser');
const { error, neutral } = require('../../utils/embed');
const { fetchRepliedMessage } = require('../../utils/actions');
const { buildReasonRow, buildDurationRow } = require('../../utils/reasonSelect');
const { parseDurationToMs } = require('../../utils/prefixHelpers');
const pendingMod = require('../../utils/pendingMod');

module.exports = {
  name: 'mute',
  async execute(message, args) {
    if (!isStaff(message.member)) {
      return message.reply({ embeds: [error('Accès refusé', 'Réservé au staff')] });
    }
    const member = await resolveMember(message.guild, args.shift());
    if (!member) return message.reply({ embeds: [error('Cible invalide', 'Membre introuvable')] });

    const firstArg = args.shift();
    const ms = parseDurationToMs(firstArg);
    
    const replied = await fetchRepliedMessage(message);
    const baseData = {
      action: 'mute',
      targetId: member.id,
      moderatorId: message.author.id,
      repliedContent: replied?.content?.slice(0, 200) || null,
    };

    if (ms) {
      pendingMod.set(message.id, {
        ...baseData,
        durationMs: ms,
        durationLabel: firstArg,
        extraReason: args.join(' ') || null,
      });

      await message.reply({
        embeds: [neutral('Mute · Choix de la raison', `Cible : <@${member.id}> · Durée : ${firstArg}`)],
        components: [buildReasonRow(message.id)],
      });
    } else {
      // Re-add firstArg to args if it wasn't a duration
      if (firstArg) args.unshift(firstArg);
      pendingMod.set(message.id, {
        ...baseData,
        extraReason: args.join(' ') || null,
      });

      await message.reply({
        embeds: [neutral('Mute · Choix de la durée', `Cible : <@${member.id}>`)],
        components: [buildDurationRow(message.id)],
      });
    }
  },
};
