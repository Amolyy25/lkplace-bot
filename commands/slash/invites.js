const { SlashCommandBuilder } = require('discord.js');
const { resolveUser } = require('../../utils/parseUser');
const { countFor } = require('../../utils/inviteTracker');
const { neutral, error } = require('../../utils/embed');
const db = require('../../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Voir le nombre d\'invitations.')
    .addUserOption(o => o.setName('cible').setDescription('Membre (sinon toi)').setRequired(false)),
  async execute(interaction) {
    if (!db.available()) {
      return interaction.reply({ embeds: [error('db indisponible', 'persistance désactivée')], ephemeral: true });
    }
    const user = interaction.options.getUser('cible') || interaction.user;
    const stats = await countFor(user.id);
    const embed = neutral(
      `invitations · ${user.tag}`,
      `<@${user.id}> a **${stats.active}** invitation(s) active(s) · ${stats.total} total · ${stats.left} parti(s)`
    );
    await interaction.reply({ embeds: [embed] });
  },
};
