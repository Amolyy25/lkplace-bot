const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { extractId } = require('../../utils/parseUser');
const { doUnban } = require('../../utils/modCore');
const { error, success, caseFooter } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Débannir un utilisateur.')
    .addStringOption(o => o.setName('cible').setDescription('ID utilisateur').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(false)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé au staff')], ephemeral: true });
    }

    const raw = interaction.options.getString('cible');
    const reason = interaction.options.getString('raison') || 'non spécifiée';
    const id = extractId(raw);
    if (!id) {
      return interaction.reply({ embeds: [error('cible invalide', 'ID incorrect')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const { caseId } = await doUnban(interaction.guild, { targetId: id, reason, moderator: interaction.user });
      const embed = success('membre débanni', `<@${id}> · raison : ${reason}`)
        .setFooter({ text: caseFooter(caseId) });
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ embeds: [error('échec', e.message)] });
    }
  },
};
