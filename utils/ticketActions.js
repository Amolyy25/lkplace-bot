const {
  ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { roles, channels: chans, ticketCategories, colors } = require('../config');
const { neutral, error, success } = require('./embed');
const { getCategory, setCategory, claim, getClaim, releaseClaim } = require('./tickets');
const { isStaff } = require('./permissions');

async function setupTicketPanel(guild) {
  for (const cat of ticketCategories) {
    let category;
    
    if (cat.categoryId) {
      category = guild.channels.cache.get(cat.categoryId);
    }

    if (!category) {
      const existing = guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === cat.label.toLowerCase()
      );
      category = existing;
    }

    if (!category) {
      category = await guild.channels.create({
        name: cat.label,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.staff, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels] },
        ],
      });
    }
    await setCategory(cat.id, category.id);
  }

  const ticketsChannel = guild.channels.cache.get(chans.tickets);
  if (!ticketsChannel) return { ok: false, reason: 'channel tickets introuvable' };

  const panel = neutral(
    'Support Lkplace',
    'Pour toute demande d\'assistance ou question relative au serveur, veuillez ouvrir un ticket en cliquant sur le bouton correspondant à votre besoin.\n\nUn membre de notre équipe reviendra vers vous dans les plus brefs délais.'
  ).setAuthor({ name: 'Centre d\'Assistance', iconURL: guild.iconURL() });

  const row = new ActionRowBuilder().addComponents(
    ...ticketCategories.map(c =>
      new ButtonBuilder()
        .setCustomId(`ticket:open:${c.id}`)
        .setLabel(c.label)
        .setStyle(ButtonStyle.Secondary)
    )
  );

  await ticketsChannel.send({ embeds: [panel], components: [row] });
  return { ok: true };
}

async function openTicket(interaction, typeId) {
  const guild = interaction.guild;
  const catDef = ticketCategories.find(c => c.id === typeId);
  const categoryId = getCategory(typeId) || catDef?.categoryId;
  
  if (!categoryId) {
    return interaction.reply({ embeds: [error('indisponible', 'catégorie non configurée — lancez /setupticket')], ephemeral: true });
  }

  const category = guild.channels.cache.get(categoryId);
  if (!category) {
    return interaction.reply({ embeds: [error('indisponible', 'catégorie introuvable')], ephemeral: true });
  }

  const existing = category.children?.cache?.find(c =>
    c.permissionOverwrites.cache.has(interaction.user.id)
  );
  if (existing) {
    return interaction.reply({ embeds: [error('ticket existant', `tu as déjà <#${existing.id}>`)], ephemeral: true });
  }

  const username = interaction.user.username.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'user';
  const channel = await guild.channels.create({
    name: `ticket-${username}`,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: roles.staff, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    ],
  });

  const welcome = neutral(
    `Ticket d'Assistance · ${catDef?.label || typeId}`,
    `Bonjour <@${interaction.user.id}>,\n\nTon ticket a bien été créé. Un membre de l'équipe **Staff** a été prévenu et prendra en charge ta demande sous peu.\n\nEn attendant, merci de bien vouloir détailler ton problème ou ta question ci-dessous afin de nous faire gagner du temps.`
  ).setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket:claim:${interaction.user.id}`).setLabel('Prendre en charge').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`ticket:close:${interaction.user.id}`).setLabel('Fermer le ticket').setStyle(ButtonStyle.Danger),
  );

  await channel.send({ content: `<@${interaction.user.id}> | <@&${roles.staff}>`, embeds: [welcome], components: [row] });
  await interaction.reply({ embeds: [success('ticket créé', `<#${channel.id}>`)], ephemeral: true });
}

async function claimTicket(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({ embeds: [error('accès refusé', 'réservé au staff')], ephemeral: true });
  }
  const ok = await claim(interaction.channel.id, interaction.user.id);
  if (!ok) {
    const current = getClaim(interaction.channel.id);
    return interaction.reply({ embeds: [error('déjà pris en charge', `responsable : <@${current}>`)], ephemeral: true });
  }
  await interaction.reply({ embeds: [success('ticket claim', `responsable : <@${interaction.user.id}>`)] });
}

async function closeTicket(interaction) {
  const channel = interaction.channel;
  const parts = interaction.customId.split(':');
  const creatorId = parts[2];

  await interaction.reply({ embeds: [neutral('fermeture', 'génération du transcript…')], ephemeral: true });

  const messages = [];
  let lastId;
  while (true) {
    const batch = await channel.messages.fetch({ limit: 100, before: lastId }).catch(() => null);
    if (!batch || batch.size === 0) break;
    messages.push(...batch.values());
    lastId = batch.last().id;
    if (batch.size < 100) break;
  }
  messages.reverse();

  const lines = messages.map(m => {
    const when = m.createdAt.toISOString();
    const author = m.author?.tag || 'inconnu';
    return `[${when}] ${author}: ${m.content || ''}`;
  });
  const transcript = Buffer.from(lines.join('\n') || '(vide)', 'utf8');
  const fileName = `transcript-${channel.name}.txt`;

  const creator = await interaction.client.users.fetch(creatorId).catch(() => null);
  if (creator) {
    await creator.send({
      embeds: [neutral('transcript', `ton ticket "${channel.name}" a été fermé`)],
      files: [{ attachment: transcript, name: fileName }],
    }).catch(() => {});
  }

  const logChannel = interaction.guild.channels.cache.get(chans.serverLogs);
  if (logChannel) {
    await logChannel.send({
      embeds: [neutral('ticket fermé', `salon : ${channel.name} · créateur : <@${creatorId}>`)],
      files: [{ attachment: transcript, name: fileName }],
    }).catch(() => {});
  }

  await releaseClaim(channel.id);
  await channel.delete('ticket fermé').catch(() => {});
}

module.exports = { setupTicketPanel, openTicket, claimTicket, closeTicket };
