const { isAdmin } = require('../../utils/permissions');
const { enableLockdown, disableLockdown, state } = require('../../utils/antiRaid');
const { error, success, neutral } = require('../../utils/embed');

module.exports = {
  name: 'lockdown',
  async execute(message, args) {
    if (!isAdmin(message.member)) return message.reply({ embeds: [error('Accès refusé', 'Réservé aux admins')] });
    const mode = (args[0] || 'status').toLowerCase();
    if (mode === 'on') {
      const ok = await enableLockdown(message.guild);
      return message.reply({ embeds: [ok ? success('Lockdown activé', 'Envoi bloqué') : neutral('Lockdown', 'Déjà actif')] });
    }
    if (mode === 'off') {
      const ok = await disableLockdown(message.guild);
      return message.reply({ embeds: [ok ? success('Lockdown désactivé', 'Envoi restauré') : neutral('Lockdown', 'Déjà inactif')] });
    }
    return message.reply({ embeds: [neutral('Lockdown', state.lockdown ? 'Actif' : 'Inactif')] });
  },
};
