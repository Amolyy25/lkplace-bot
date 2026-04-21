const { send } = require('../utils/serverLog');
const { fetchExecutor, AuditLogEvent } = require('../utils/auditLog');
const { colors } = require('../config');

module.exports = {
  name: 'roleDelete',
  async execute(role) {
    const exec = await fetchExecutor(role.guild, AuditLogEvent.RoleDelete, role.id);
    await send(role.guild, {
      title: 'rôle supprimé',
      description: `nom : ${role.name}${exec ? ` · par : <@${exec.id}>` : ''}`,
      color: colors.error,
    });
  },
};
