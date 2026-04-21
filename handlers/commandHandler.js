const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadSlashCommands(client) {
  client.slashCommands = new Collection();
  const dir = path.join(__dirname, '..', 'commands', 'slash');
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(dir, file));
    if (cmd?.data?.name && typeof cmd.execute === 'function') {
      client.slashCommands.set(cmd.data.name, cmd);
    }
  }
}

function loadPrefixCommands(client) {
  client.prefixCommands = new Collection();
  const dir = path.join(__dirname, '..', 'commands', 'prefix');
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(dir, file));
    if (cmd?.name && typeof cmd.execute === 'function') {
      client.prefixCommands.set(cmd.name, cmd);
      for (const alias of cmd.aliases || []) client.prefixCommands.set(alias, cmd);
    }
  }
}

module.exports = { loadSlashCommands, loadPrefixCommands };
