const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { getCase, formatDate, TYPE_LABEL } = require('../../utils/sanctionsQueries');
const { neutral, error } = require('../../utils/embed');
const db = require('../../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('Détails d\'une sanction.')
    .addIntegerOption(o => o.setName('id').setDescription('Numéro de cas').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé au staff')], ephemeral: true });
    }
    if (!db.available()) {
      return interaction.reply({ embeds: [error('db indisponible', 'persistance désactivée')], ephemeral: true });
    }

    const id = interaction.options.getInteger('id');
    const row = await getCase(id);
    if (!row) return interaction.reply({ embeds: [error('introuvable', `aucun cas #${id}`)], ephemeral: true });

    const t = TYPE_LABEL[row.type] || row.type;
    const desc = [
      `type : ${t}${row.active === false ? ' (inactif)' : ''}`,
      `cible : <@${row.target_id}>${row.target_tag ? ` (${row.target_tag})` : ''}`,
      `modérateur : ${row.moderator_id ? `<@${row.moderator_id}>` : '—'}`,
      `raison : ${row.reason || '—'}`,
      row.duration_label ? `durée : ${row.duration_label}` : null,
      `date : ${formatDate(row.created_at)}`,
    ].filter(Boolean).join('\n');

    await interaction.reply({ embeds: [neutral(`cas #${row.id}`, desc)], ephemeral: true });
  },
};
