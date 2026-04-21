const { send } = require('../utils/serverLog');
const { fetchExecutor, AuditLogEvent } = require('../utils/auditLog');
const { colors } = require('../config');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    const oldRoles = oldMember.roles?.cache || new Map();
    const newRoles = newMember.roles?.cache || new Map();

    const added = [...newRoles.values()].filter(r => !oldRoles.has(r.id));
    const removed = [...oldRoles.values()].filter(r => !newRoles.has(r.id));
    if (!added.length && !removed.length) return;

    const executor = await fetchExecutor(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.id);
    const lines = [];
    if (added.length) lines.push(`ajoutés : ${added.map(r => r.toString()).join(', ')}`);
    if (removed.length) lines.push(`retirés : ${removed.map(r => r.toString()).join(', ')}`);
    if (executor) lines.push(`par : <@${executor.id}>`);

    await send(newMember.guild, {
      title: 'rôles modifiés',
      description: `cible : <@${newMember.id}>\n${lines.join(' · ')}`,
      color: colors.neutral,
    });
  },
};
