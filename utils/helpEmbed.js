const { neutral } = require('./embed');
const { prefix } = require('../config');

function buildHelpEmbed() {
  const embed = neutral('Centre d\'Aide Lkplace', 'Retrouvez ci-dessous la liste des commandes disponibles sur le bot.\nLe préfixe actuel est : `' + prefix + '`')
    .addFields(
      { name: 'Protection & Modération', value: '`ban`, `kick`, `mute`, `unmute`, `warn`, `clear`, `unban`', inline: false },
      { name: 'Administration', value: '`bban`, `mmute`, `lockdown`, `addmembers`', inline: false },
      { name: 'Gestion & Logs', value: '`sanctions`, `case`, `setupticket`', inline: false },
      { name: 'Informations', value: '`members`, `boosts`, `invites`, `help`, `level`, `leaderboard`', inline: false }
    )
    .setTimestamp();
  
  return embed;
}

module.exports = { buildHelpEmbed };
