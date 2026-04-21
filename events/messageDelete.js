const { send } = require('../utils/serverLog');
const { colors } = require('../config');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    const content = message.content || '(contenu indisponible)';
    const description = `auteur : <@${message.author?.id || 'inconnu'}> · salon : <#${message.channelId}>\n> ${content.slice(0, 500)}`;
    await send(message.guild, { title: 'message supprimé', description, color: colors.error });
  },
};
