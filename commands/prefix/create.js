const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { error, neutral } = require('../../utils/embed');
const { setDraft, getDraft } = require('../../utils/embedDrafts');

module.exports = {
  name: 'create',
  async execute(message, args) {
    if (!isStaff(message.member)) {
      return message.reply({ embeds: [error('Accès refusé', 'Réservé au staff')] });
    }

    // Initialize draft
    setDraft(message.author.id, {
      title: 'Nouvel Embed',
      description: 'Ceci est une description par défaut.',
      color: '#FFFFFF'
    });

    const draft = getDraft(message.author.id);
    const embed = new EmbedBuilder()
      .setTitle(draft.title)
      .setDescription(draft.description)
      .setColor(draft.color);

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('embed:title').setLabel('Titre').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('embed:desc').setLabel('Description').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('embed:color').setLabel('Couleur').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('embed:image').setLabel('Image').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('embed:footer').setLabel('Footer').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('embed:preview').setLabel('Aperçu').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('embed:send').setLabel('Envoyer').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('embed:cancel').setLabel('Annuler').setStyle(ButtonStyle.Danger)
    );

    await message.reply({
      content: '### 🎨 Constructeur d\'Embed\nUtilise les boutons ci-dessous pour personnaliser ton embed.',
      embeds: [embed],
      components: [row1, row2]
    });
  },
};
