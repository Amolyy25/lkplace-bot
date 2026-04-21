const tickets = require('../utils/tickets');
const ghostping = require('../utils/ghostping');
const inviteTracker = require('../utils/inviteTracker');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Connecté en tant que ${client.user.tag}`);
    await Promise.all([tickets.loadFromDb(), ghostping.loadFromDb()]);
    await Promise.all(client.guilds.cache.map(g => inviteTracker.primeCache(g)));
    console.log('[state] chargé depuis la DB + cache invitations');
  },
};
