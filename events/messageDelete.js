const { send } = require('../utils/serverLog');
const { isWatched, getConfig } = require('../utils/ghostping');
const { EmbedBuilder } = require('discord.js');
const { colors } = require('../config');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    const content = message.content || '(contenu indisponible)';
    const description = `auteur : <@${message.author?.id || 'inconnu'}> · salon : <#${message.channelId}>\n> ${content.slice(0, 500)}`;
    await send(message.guild, { title: 'message supprimé', description, color: colors.error });

    if (message.mentions?.users?.size || message.mentions?.roles?.size) {
      if (isWatched(message.channelId)) {
        const { deleteAfterMs } = getConfig();
        const target = message.mentions.users.first() || message.mentions.roles.first();
        const alert = new EmbedBuilder()
          .setColor(colors.warning)
          .setTitle('ghost ping détecté')
          .setDescription(`auteur : <@${message.author.id}> · cible : ${target.toString()}\n> ${content.slice(0, 300)}`);
        const sent = await message.channel.send({ embeds: [alert] }).catch(() => null);
        if (sent && deleteAfterMs > 0) {
          setTimeout(() => sent.delete().catch(() => {}), deleteAfterMs);
        }
      }
    }
  },
};
