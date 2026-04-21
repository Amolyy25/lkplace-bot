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
  { value: 'mention_abusive', label: 'mention abusive' },
  { value: 'toxic',           label: 'comportement toxique' },
  { value: 'autre',           label: 'autre' },
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

module.exports = { REASONS, labelFor, buildReasonRow };
