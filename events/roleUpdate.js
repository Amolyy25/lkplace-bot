const { send } = require('../utils/serverLog');
const { fetchExecutor, AuditLogEvent } = require('../utils/auditLog');
const { colors } = require('../config');

module.exports = {
  name: 'roleUpdate',
  async execute(oldRole, newRole) {
    const changes = [];
    if (oldRole.name !== newRole.name) changes.push(`nom : ${oldRole.name} → ${newRole.name}`);
    if (oldRole.hexColor !== newRole.hexColor) changes.push(`couleur : ${oldRole.hexColor} → ${newRole.hexColor}`);
    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) changes.push(`permissions modifiées`);
    if (!changes.length) return;
    const exec = await fetchExecutor(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id);
    await send(newRole.guild, {
      title: 'rôle modifié',
      description: `${newRole.toString()} · ${changes.join(' · ')}${exec ? ` · par : <@${exec.id}>` : ''}`,
      color: colors.warning,
    });
  },
};
