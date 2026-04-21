const {
  SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder,
} = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { resolveMember } = require('../../utils/parseUser');
const { check } = require('../../utils/rateLimit');
const { doMute } = require('../../utils/modCore');
const { error, success, neutral, caseFooter } = require('../../utils/embed');

const DURATIONS = [
  { label: '5 min',   value: '300000',     ms: 300_000 },
  { label: '15 min',  value: '900000',     ms: 900_000 },
  { label: '30 min',  value: '1800000',    ms: 1_800_000 },
  { label: '1h',      value: '3600000',    ms: 3_600_000 },
  { label: '2h',      value: '7200000',    ms: 7_200_000 },
  { label: '6h',      value: '21600000',   ms: 21_600_000 },
  { label: '12h',     value: '43200000',   ms: 43_200_000 },
  { label: '24h',     value: '86400000',   ms: 86_400_000 },
  { label: '7 jours', value: '604800000',  ms: 604_800_000 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute (timeout) un membre.')
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

    const select = new StringSelectMenuBuilder()
      .setCustomId(`mute:${member.id}:${encodeURIComponent(reason)}`)
      .setPlaceholder('choisir une durée')
      .addOptions(DURATIONS.map(d => ({ label: d.label, value: d.value })));

    const row = new ActionRowBuilder().addComponents(select);
    const embed = neutral('mute', `cible : <@${member.id}> · sélectionne la durée`);
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },

  durations: DURATIONS,

  async handleSelect(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé au staff')], ephemeral: true });
    }

    const quota = check(interaction.user.id, 'mute');
    if (!quota.ok) {
      return interaction.update({ embeds: [error('quota atteint', 'limite de /mute par heure atteinte')], components: [] });
    }

    const [, targetId, reasonEnc] = interaction.customId.split(':');
    const reason = decodeURIComponent(reasonEnc || '');
    const ms = Number(interaction.values[0]);
    const label = DURATIONS.find(d => d.ms === ms)?.label || `${ms} ms`;

    const member = await resolveMember(interaction.guild, targetId);
    if (!member) {
      return interaction.update({ embeds: [error('cible invalide', 'membre introuvable')], components: [] });
    }

    try {
      const { caseId } = await doMute(interaction.guild, {
        targetMember: member, reason, durationMs: ms, durationLabel: label, moderator: interaction.user,
      });
      const embed = success('membre mute', `<@${member.id}> a été mute · durée : ${label}`)
        .setFooter({ text: caseFooter(caseId) });
      await interaction.update({ embeds: [embed], components: [] });
    } catch (e) {
      await interaction.update({ embeds: [error('échec', e.message)], components: [] });
    }
  },
};
