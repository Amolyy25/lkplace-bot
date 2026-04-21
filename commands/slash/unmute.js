const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { resolveMember } = require('../../utils/parseUser');
const { doUnmute } = require('../../utils/modCore');
const { error, success, caseFooter } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Retirer le mute d\'un membre.')
    .addStringOption(o => o.setName('cible').setDescription('Mention ou ID').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(false)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé au staff')], ephemeral: true });
    }

    const raw = interaction.options.getString('cible');
    const reason = interaction.options.getString('raison') || 'non spécifiée';
    const member = await resolveMember(interaction.guild, raw);
    if (!member) {
      return interaction.reply({ embeds: [error('cible invalide', 'membre introuvable')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const { caseId } = await doUnmute(interaction.guild, { targetMember: member, reason, moderator: interaction.user });
      const embed = success('membre unmute', `<@${member.id}> · raison : ${reason}`)
        .setFooter({ text: caseFooter(caseId) });
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ embeds: [error('échec', e.message)] });
    }
  },
};
