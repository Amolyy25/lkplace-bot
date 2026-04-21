const { EmbedBuilder } = require('discord.js');
const { channels, colors } = require('../config');

function buildEmbed({ title, description, color = colors.neutral, fields = [] }) {
  const e = new EmbedBuilder().setColor(color).setTitle(title).setTimestamp(new Date());
  if (description) e.setDescription(description);
  if (fields.length) e.addFields(fields);
  return e;
}

async function send(guild, opts) {
  const ch = guild?.channels?.cache?.get(channels.serverLogs);
  if (!ch) return;
  await ch.send({ embeds: [buildEmbed(opts)] }).catch(() => {});
}

module.exports = { send };
