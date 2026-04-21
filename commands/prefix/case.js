const { isStaff } = require('../../utils/permissions');
const { getCase, formatDate, TYPE_LABEL } = require('../../utils/sanctionsQueries');
const { neutral, error } = require('../../utils/embed');
const db = require('../../utils/db');

module.exports = {
  name: 'case',
  aliases: ['cas'],
  async execute(message, args) {
    if (!isStaff(message.member)) {
      return message.reply({ embeds: [error('accès refusé', 'réservé au staff')] });
    }
    if (!db.available()) {
      return message.reply({ embeds: [error('db indisponible', 'persistance désactivée')] });
    }
    const id = Number(args[0]);
    if (!Number.isInteger(id) || id < 1) {
      return message.reply({ embeds: [error('id invalide', 'indique un numéro de cas')] });
    }
    const row = await getCase(id);
    if (!row) return message.reply({ embeds: [error('introuvable', `aucun cas #${id}`)] });

    const t = TYPE_LABEL[row.type] || row.type;
    const desc = [
      `type : ${t}${row.active === false ? ' (inactif)' : ''}`,
      `cible : <@${row.target_id}>${row.target_tag ? ` (${row.target_tag})` : ''}`,
      `modérateur : ${row.moderator_id ? `<@${row.moderator_id}>` : '—'}`,
      `raison : ${row.reason || '—'}`,
      row.duration_label ? `durée : ${row.duration_label}` : null,
      `date : ${formatDate(row.created_at)}`,
    ].filter(Boolean).join('\n');

    await message.reply({ embeds: [neutral(`cas #${row.id}`, desc)] });
  },
};
