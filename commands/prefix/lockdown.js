const { isAdmin } = require('../../utils/permissions');
const { enableLockdown, disableLockdown, state } = require('../../utils/antiRaid');
const { error, success, neutral } = require('../../utils/embed');

module.exports = {
  name: 'lockdown',
  async execute(message, args) {
    if (!isAdmin(message.member)) return message.reply({ embeds: [error('accès refusé', 'réservé aux admins')] });
    const mode = (args[0] || 'status').toLowerCase();
    if (mode === 'on') {
      const ok = await enableLockdown(message.guild);
      return message.reply({ embeds: [ok ? success('lockdown activé', 'envoi bloqué') : neutral('lockdown', 'déjà actif')] });
    }
    if (mode === 'off') {
      const ok = await disableLockdown(message.guild);
      return message.reply({ embeds: [ok ? success('lockdown désactivé', 'envoi restauré') : neutral('lockdown', 'déjà inactif')] });
    }
    return message.reply({ embeds: [neutral('lockdown', state.lockdown ? 'actif' : 'inactif')] });
  },
};
