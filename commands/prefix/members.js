const { neutral } = require('../../utils/embed');

module.exports = {
  name: 'members',
  async execute(message) {
    const guild = message.guild;
    if (guild.members.cache.size < guild.memberCount) {
      await guild.members.fetch().catch(() => {});
    }
    const humans = guild.members.cache.filter(m => !m.user.bot).size;
    await message.reply({ embeds: [neutral('membres humains', `${humans}`)] });
  },
};
