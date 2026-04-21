const { neutral } = require('../../utils/embed');

module.exports = {
  name: 'boosts',
  async execute(message) {
    const tier = message.guild.premiumTier;
    const count = message.guild.premiumSubscriptionCount || 0;
    await message.reply({ embeds: [neutral('boosts', `niveau : ${tier} · actifs : ${count}`)] });
  },
};
