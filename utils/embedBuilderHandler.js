const { 
  ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, 
  EmbedBuilder, ChannelSelectMenuBuilder, ChannelType 
} = require('discord.js');
const { getDraft, updateDraft, deleteDraft } = require('./embedDrafts');
const { error, success } = require('./embed');

async function handleEmbedButton(interaction) {
  const userId = interaction.user.id;
  const draft = getDraft(userId);
  if (!draft) return interaction.reply({ embeds: [error('Erreur', 'Aucun brouillon trouvé. Recommence avec -create')], ephemeral: true });

  const customId = interaction.customId;

  if (customId === 'embed:cancel') {
    deleteDraft(userId);
    return interaction.update({ content: '❌ Création annulée.', embeds: [], components: [] });
  }

  if (customId === 'embed:send') {
    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('embed:select_channel')
      .setPlaceholder('Sélectionne le salon où envoyer l\'embed')
      .addChannelTypes(ChannelType.GuildText);

    const row = new ActionRowBuilder().addComponents(channelSelect);
    return interaction.reply({ content: 'Où souhaites-tu envoyer cet embed ?', components: [row], ephemeral: true });
  }

  if (customId === 'embed:preview') {
    const embed = buildEmbed(draft);
    return interaction.reply({ content: 'Aperçu de ton embed :', embeds: [embed], ephemeral: true });
  }

  // Modals for other buttons
  const modal = new ModalBuilder().setCustomId(`modal:${customId}`).setTitle('Personnalisation');

  if (customId === 'embed:title') {
    const input = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('Titre de l\'embed')
      .setStyle(TextInputStyle.Short)
      .setValue(draft.title || '')
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
  } else if (customId === 'embed:desc') {
    const input = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Description de l\'embed')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(draft.description || '')
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
  } else if (customId === 'embed:color') {
    const input = new TextInputBuilder()
      .setCustomId('color')
      .setLabel('Couleur (Hex: #FFFFFF)')
      .setStyle(TextInputStyle.Short)
      .setValue(draft.color || '#FFFFFF')
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
  } else if (customId === 'embed:image') {
    const input = new TextInputBuilder()
      .setCustomId('image')
      .setLabel('Lien de l\'image (URL)')
      .setStyle(TextInputStyle.Short)
      .setValue(draft.image || '')
      .setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
  } else if (customId === 'embed:footer') {
    const input = new TextInputBuilder()
      .setCustomId('footer')
      .setLabel('Texte du footer')
      .setStyle(TextInputStyle.Short)
      .setValue(draft.footer || '')
      .setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
  }

  await interaction.showModal(modal);
}

async function handleEmbedModal(interaction) {
  const userId = interaction.user.id;
  const draft = getDraft(userId);
  if (!draft) return;

  const customId = interaction.customId;
  const updates = {};

  if (customId === 'modal:embed:title') updates.title = interaction.fields.getTextInputValue('title');
  if (customId === 'modal:embed:desc') updates.description = interaction.fields.getTextInputValue('description');
  if (customId === 'modal:embed:color') updates.color = interaction.fields.getTextInputValue('color');
  if (customId === 'modal:embed:image') updates.image = interaction.fields.getTextInputValue('image');
  if (customId === 'modal:embed:footer') updates.footer = interaction.fields.getTextInputValue('footer');

  updateDraft(userId, updates);
  const newDraft = getDraft(userId);
  const embed = buildEmbed(newDraft);

  await interaction.update({ embeds: [embed] });
}

async function handleEmbedChannelSelect(interaction) {
  const userId = interaction.user.id;
  const draft = getDraft(userId);
  if (!draft) return interaction.reply({ content: 'Erreur: brouillon perdu.', ephemeral: true });

  const channelId = interaction.values[0];
  const channel = interaction.guild.channels.cache.get(channelId);

  if (!channel) return interaction.reply({ content: 'Salon introuvable.', ephemeral: true });

  const embed = buildEmbed(draft);
  await channel.send({ embeds: [embed] });

  deleteDraft(userId);
  await interaction.update({ content: `✅ Embed envoyé dans <#${channelId}>`, components: [] });
}

function buildEmbed(draft) {
  const embed = new EmbedBuilder()
    .setTitle(draft.title || null)
    .setDescription(draft.description || null)
    .setColor(draft.color || '#FFFFFF');

  if (draft.image) embed.setImage(draft.image);
  if (draft.footer) embed.setFooter({ text: draft.footer });

  return embed;
}

module.exports = { handleEmbedButton, handleEmbedModal, handleEmbedChannelSelect };
