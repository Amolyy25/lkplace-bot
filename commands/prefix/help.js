const { buildHelpEmbed } = require('../../utils/helpEmbed');

module.exports = {
  name: 'help',
  aliases: ['aide'],
  async execute(message) {
    await message.reply({ embeds: [buildHelpEmbed()] });
  },
};
