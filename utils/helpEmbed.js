const { neutral } = require('./embed');
const { prefix } = require('../config');

function buildHelpEmbed() {
  const lines = [
    `préfixe : \`${prefix}\` · ou utilise les slash commands`,
    '',
    `**modération** — ban, kick, mute, unmute, warn, clear, unban`,
    `**historique** — sanctions, case`,
    `**admin** — bban, mmute, lockdown`,
    `**tickets** — setupticket, gostping`,
    `**infos** — members, boosts, help`,
  ];
  return neutral('aide', lines.join('\n'));
}

module.exports = { buildHelpEmbed };
