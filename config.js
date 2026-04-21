require('dotenv').config();

module.exports = {
  token: process.env.token,
  clientId: process.env.id,
  guildId: process.env.guild_id,
  prefix: process.env.prefix || '-',

  channels: {
    modLogs: '1496077823801032806',
    serverLogs: '1496078233819676803',
    tickets: '1496075783423135805',
    welcome: '1496069792182960208',
  },

  roles: {
    staff: '1496077550219300864',
  },

  colors: {
    neutral: 0xFFFFFF,
    success: 0x57F287,
    error: 0xED4245,
    warning: 0xFEE75C,
    welcome: 0x5865F2,
  },

  quotas: {
    ban: 5,
    kick: 10,
    mute: 20,
    warn: 30,
    clear: 10,
  },

  antiSpam: {
    messages: 5,
    windowMs: 5_000,
    muteMs: 10 * 60 * 1000,
  },

  antiRaid: {
    joins: 10,
    windowMs: 30_000,
  },

  ticketCategories: [
    { id: 'staff', label: 'Devenir staff', description: 'candidature staff' },
    { id: 'report', label: 'Réclamation / Signalement', description: 'signalement ou abus' },
    { id: 'question', label: 'Question générale', description: 'question sur le serveur' },
  ],
};
