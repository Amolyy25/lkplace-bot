const { SlashCommandBuilder } = require('discord.js');
const { neutral } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('members')
    .setDescription('Afficher le nombre de membres humains.'),
  async execute(interaction) {
    const guild = interaction.guild;
    if (guild.members.cache.size < guild.memberCount) {
      await guild.members.fetch().catch(() => {});
    }
    const humans = guild.members.cache.filter(m => !m.user.bot).size;
    await interaction.reply({ embeds: [neutral('membres humains', `${humans}`)] });
  },
};
