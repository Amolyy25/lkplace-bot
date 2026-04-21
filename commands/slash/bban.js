const { SlashCommandBuilder } = require('discord.js');
const { isAdmin } = require('../../utils/permissions');
const { resolveUser } = require('../../utils/parseUser');
const { doBan } = require('../../utils/modCore');
const { error, success, caseFooter } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bban')
    .setDescription('Ban immédiat (admin).')
    .addStringOption(o => o.setName('cible').setDescription('Mention ou ID').setRequired(true)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé aux admins')], ephemeral: true });
    }
    const raw = interaction.options.getString('cible');
    const user = await resolveUser(interaction.client, raw);
    if (!user) {
      return interaction.reply({ embeds: [error('cible invalide', 'mention ou ID incorrect')], ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      const { caseId } = await doBan(interaction.guild, { targetUser: user, reason: 'bban (admin)', silent: true, moderator: interaction.user });
      const embed = success('membre banni', `<@${user.id}> a été banni`).setFooter({ text: caseFooter(caseId) });
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ embeds: [error('échec', e.message)] });
    }
  },
};
