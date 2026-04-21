const tickets = require('../utils/tickets');
const ghostping = require('../utils/ghostping');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Connecté en tant que ${client.user.tag}`);
    await Promise.all([tickets.loadFromDb(), ghostping.loadFromDb()]);
    console.log('[state] chargé depuis la DB');
  },
};
