const { send } = require('../utils/serverLog');
const { fetchExecutor, AuditLogEvent } = require('../utils/auditLog');
const { colors } = require('../config');

module.exports = {
  name: 'roleCreate',
  async execute(role) {
    const exec = await fetchExecutor(role.guild, AuditLogEvent.RoleCreate, role.id);
    await send(role.guild, {
      title: 'rôle créé',
      description: `${role.toString()} · nom : ${role.name}${exec ? ` · par : <@${exec.id}>` : ''}`,
      color: colors.success,
    });
  },
};
