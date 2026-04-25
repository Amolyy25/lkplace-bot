const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const REASONS = [
  { value: 'spam',            label: 'spam' },
  { value: 'flood',           label: 'flood' },
  { value: 'contenu_inap',    label: 'contenu inapproprié' },
  { value: 'insultes',        label: 'insultes / harcèlement' },
  { value: 'publicite',       label: 'publicité / invitation' },
  { value: 'contournement',   label: 'contournement de sanction' },
  { value: 'raid',            label: 'raid / comportement malveillant' },
  { value: 'nsfw',            label: 'contenu nsfw' },
  { value: 'mineurs',         label: 'mineurs' },
  { value: 'mention_abusive', label: 'mention abusive' },
  { value: 'toxic',           label: 'comportement toxique' },
  { value: 'autre',           label: 'autre' },
];

const DURATIONS = [
  { label: '5 min',   value: '300000' },
  { label: '15 min',  value: '900000' },
  { label: '30 min',  value: '1800000' },
  { label: '1h',      value: '3600000' },
  { label: '2h',      value: '7200000' },
  { label: '6h',      value: '21600000' },
  { label: '12h',     value: '43200000' },
  { label: '24h',     value: '86400000' },
  { label: '7 jours', value: '604800000' },
];

function labelFor(value) {
  return REASONS.find(r => r.value === value)?.label || value;
}

function buildReasonRow(pendingId) {
  const select = new StringSelectMenuBuilder()
    .setCustomId(`reason:${pendingId}`)
    .setPlaceholder('choisir une catégorie')
    .addOptions(REASONS);
  return new ActionRowBuilder().addComponents(select);
}

function buildDurationRow(pendingId) {
  const select = new StringSelectMenuBuilder()
    .setCustomId(`duration:${pendingId}`)
    .setPlaceholder('choisir une durée')
    .addOptions(DURATIONS);
  return new ActionRowBuilder().addComponents(select);
}

module.exports = { REASONS, DURATIONS, labelFor, buildReasonRow, buildDurationRow };
