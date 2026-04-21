const { SlashCommandBuilder } = require('discord.js');
const { isAdmin } = require('../../utils/permissions');
const { resolveMember } = require('../../utils/parseUser');
const { doMute } = require('../../utils/modCore');
const { error, success, caseFooter } = require('../../utils/embed');

const DURATION_MS = 24 * 60 * 60 * 1000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mmute')
    .setDescription('Mute 24h immédiat (admin).')
    .addStringOption(o => o.setName('cible').setDescription('Mention ou ID').setRequired(true)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé aux admins')], ephemeral: true });
    }
    const raw = interaction.options.getString('cible');
    const member = await resolveMember(interaction.guild, raw);
    if (!member) {
      return interaction.reply({ embeds: [error('cible invalide', 'membre introuvable')], ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      const { caseId } = await doMute(interaction.guild, {
        targetMember: member, reason: 'mmute (admin)', durationMs: DURATION_MS, durationLabel: '24h', moderator: interaction.user,
      });
      const embed = success('membre mute', `<@${member.id}> · 24h`).setFooter({ text: caseFooter(caseId) });
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ embeds: [error('échec', e.message)] });
    }
  },
};
