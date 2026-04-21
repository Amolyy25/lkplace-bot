const { isStaff } = require('../../utils/permissions');
const { check } = require('../../utils/rateLimit');
const { doClear } = require('../../utils/modCore');
const { error, success } = require('../../utils/embed');

module.exports = {
  name: 'clear',
  aliases: ['purge'],
  async execute(message, args) {
    if (!isStaff(message.member)) return message.reply({ embeds: [error('accès refusé', 'réservé au staff')] });
    const quota = check(message.author.id, 'clear');
    if (!quota.ok) return message.reply({ embeds: [error('quota atteint', 'limite de clear par heure atteinte')] });

    const amount = Math.min(100, Math.max(1, Number(args[0]) || 0));
    if (!amount) return message.reply({ embeds: [error('nombre invalide', 'indique un nombre entre 1 et 100')] });

    try {
      await message.delete().catch(() => {});
      const deleted = await doClear(message.channel, amount);
      const reply = await message.channel.send({ embeds: [success('messages supprimés', `${deleted} message(s) effacé(s)`)] });
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } catch (e) {
      await message.channel.send({ embeds: [error('échec', e.message)] });
    }
  },
};
