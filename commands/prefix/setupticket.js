const { isAdmin } = require('../../utils/permissions');
const { setupTicketPanel } = require('../../utils/ticketActions');
const { error, success } = require('../../utils/embed');

module.exports = {
  name: 'setupticket',
  async execute(message) {
    if (!isAdmin(message.member)) {
      return message.reply({ embeds: [error('accès refusé', 'réservé aux admins')] });
    }
    try {
      const res = await setupTicketPanel(message.guild);
      if (!res.ok) return message.reply({ embeds: [error('échec', res.reason)] });
      await message.reply({ embeds: [success('tickets prêts', 'panneau envoyé et catégories initialisées')] });
    } catch (e) {
      await message.reply({ embeds: [error('échec', e.message)] });
    }
  },
};
