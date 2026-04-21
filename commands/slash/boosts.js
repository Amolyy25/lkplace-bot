const { SlashCommandBuilder } = require('discord.js');
const { neutral } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('boosts')
    .setDescription('Afficher le niveau et le nombre de boosts.'),
  async execute(interaction) {
    const tier = interaction.guild.premiumTier;
    const count = interaction.guild.premiumSubscriptionCount || 0;
    await interaction.reply({ embeds: [neutral('boosts', `niveau : ${tier} · actifs : ${count}`)] });
  },
};
