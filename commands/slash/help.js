const { SlashCommandBuilder } = require('discord.js');
const { buildHelpEmbed } = require('../../utils/helpEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Afficher la liste des commandes.'),
  async execute(interaction) {
    await interaction.reply({ embeds: [buildHelpEmbed()], ephemeral: true });
  },
};
