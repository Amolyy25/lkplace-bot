const { send } = require('../utils/serverLog');
const { fetchExecutor, AuditLogEvent } = require('../utils/auditLog');
const { colors } = require('../config');

module.exports = {
  name: 'channelUpdate',
  async execute(oldChannel, newChannel) {
    if (!newChannel.guild) return;
    const changes = [];
    if (oldChannel.name !== newChannel.name) changes.push(`nom : ${oldChannel.name} → ${newChannel.name}`);
    if (oldChannel.topic !== newChannel.topic) changes.push(`sujet modifié`);
    if (!changes.length) return;
    const exec = await fetchExecutor(newChannel.guild, AuditLogEvent.ChannelUpdate, newChannel.id);
    await send(newChannel.guild, {
      title: 'salon modifié',
      description: `${newChannel.toString()} · ${changes.join(' · ')}${exec ? ` · par : <@${exec.id}>` : ''}`,
      color: colors.warning,
    });
  },
};
