const { send } = require('../utils/serverLog');
const { colors } = require('../config');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const before = (oldMessage.content || '(indisponible)').slice(0, 400);
    const after = (newMessage.content || '(vide)').slice(0, 400);
    await send(newMessage.guild, {
      title: 'message modifié',
      description: `auteur : <@${newMessage.author.id}> · salon : <#${newMessage.channelId}>\navant : ${before}\naprès : ${after}`,
      color: colors.warning,
    });
  },
};
