const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { resolveUser } = require('../../utils/parseUser');
const { listForUser, countForUser, formatDate, TYPE_LABEL } = require('../../utils/sanctionsQueries');
const { neutral, error } = require('../../utils/embed');
const db = require('../../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sanctions')
    .setDescription('Historique des sanctions d\'un utilisateur.')
    .addStringOption(o => o.setName('cible').setDescription('Mention ou ID').setRequired(true)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé au staff')], ephemeral: true });
    }
    if (!db.available()) {
      return interaction.reply({ embeds: [error('db indisponible', 'persistance désactivée')], ephemeral: true });
    }

    const raw = interaction.options.getString('cible');
    const user = await resolveUser(interaction.client, raw);
    if (!user) return interaction.reply({ embeds: [error('cible invalide', 'mention ou ID incorrect')], ephemeral: true });

    await interaction.deferReply({ ephemeral: true });
    const [rows, counts] = await Promise.all([listForUser(user.id, 10), countForUser(user.id)]);

    if (!rows?.length) {
      return interaction.editReply({ embeds: [neutral(`sanctions · ${user.tag}`, 'aucun historique')] });
    }

    const lines = rows.map(r => {
      const t = TYPE_LABEL[r.type] || r.type;
      const dur = r.duration_label ? ` · ${r.duration_label}` : '';
      const reason = r.reason ? ` — ${r.reason.slice(0, 80)}` : '';
      return `\`#${r.id}\` · ${t}${dur} · ${formatDate(r.created_at)}${reason}`;
    });

    const summary = counts.map(c => `${TYPE_LABEL[c.type] || c.type}:${c.n}`).join(' · ');
    const embed = neutral(`sanctions · ${user.tag}`, lines.join('\n'))
      .setThumbnail(user.displayAvatarURL({ size: 128 }))
      .setFooter({ text: `total — ${summary}` });

    await interaction.editReply({ embeds: [embed] });
  },
};
