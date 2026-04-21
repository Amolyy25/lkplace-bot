const { SlashCommandBuilder } = require('discord.js');
const { isAdmin } = require('../../utils/permissions');
const { setupTicketPanel } = require('../../utils/ticketActions');
const { error, success } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupticket')
    .setDescription('Installer le panneau de tickets.'),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé aux admins')], ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      const res = await setupTicketPanel(interaction.guild);
      if (!res.ok) return interaction.editReply({ embeds: [error('échec', res.reason)] });
      await interaction.editReply({ embeds: [success('tickets prêts', 'panneau envoyé et catégories initialisées')] });
    } catch (e) {
      await interaction.editReply({ embeds: [error('échec', e.message)] });
    }
  },
};
