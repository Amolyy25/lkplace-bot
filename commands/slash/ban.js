const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { resolveUser } = require('../../utils/parseUser');
const { check } = require('../../utils/rateLimit');
const { doBan } = require('../../utils/modCore');
const { error, success, caseFooter } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre (permanent).')
    .addStringOption(o => o.setName('cible').setDescription('Mention ou ID').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(false)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé au staff')], ephemeral: true });
    }

    const quota = check(interaction.user.id, 'ban');
    if (!quota.ok) {
      return interaction.reply({ embeds: [error('quota atteint', 'limite de /ban par heure atteinte')], ephemeral: true });
    }

    const raw = interaction.options.getString('cible');
    const reason = interaction.options.getString('raison') || 'non spécifiée';
    const user = await resolveUser(interaction.client, raw);
    if (!user) {
      return interaction.reply({ embeds: [error('cible invalide', 'mention ou ID incorrect')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const { caseId } = await doBan(interaction.guild, { targetUser: user, reason, moderator: interaction.user });
      const embed = success('membre banni', `<@${user.id}> a été banni · raison : ${reason}`)
        .setFooter({ text: caseFooter(caseId) });
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ embeds: [error('échec', e.message)] });
    }
  },
};
