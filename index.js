const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config');
const db = require('./utils/db');
const { loadSlashCommands, loadPrefixCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

if (!token) {
  console.error('Missing token in .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.User,
  ],
});

loadSlashCommands(client);
loadPrefixCommands(client);
loadEvents(client);

process.on('unhandledRejection', err => console.error('unhandledRejection', err));
process.on('uncaughtException', err => console.error('uncaughtException', err));

(async () => {
  await db.init();
  await client.login(token);
})();
