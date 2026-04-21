const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { check } = require('../../utils/rateLimit');
const { doClear } = require('../../utils/modCore');
const { error, success } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprimer des messages dans ce salon.')
    .addIntegerOption(o => o.setName('nombre').setDescription('1 à 100').setRequired(true).setMinValue(1).setMaxValue(100)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé au staff')], ephemeral: true });
    }

    const quota = check(interaction.user.id, 'clear');
    if (!quota.ok) {
      return interaction.reply({ embeds: [error('quota atteint', 'limite de /clear par heure atteinte')], ephemeral: true });
    }

    const amount = interaction.options.getInteger('nombre');
    await interaction.deferReply({ ephemeral: true });
    try {
      const deleted = await doClear(interaction.channel, amount);
      await interaction.editReply({ embeds: [success('messages supprimés', `${deleted} message(s) effacé(s)`)] });
    } catch (e) {
      await interaction.editReply({ embeds: [error('échec', e.message)] });
    }
  },
};
