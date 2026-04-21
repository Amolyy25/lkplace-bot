const { send } = require('../utils/serverLog');
const { fetchExecutor, AuditLogEvent } = require('../utils/auditLog');
const { colors } = require('../config');

module.exports = {
  name: 'channelDelete',
  async execute(channel) {
    if (!channel.guild) return;
    const exec = await fetchExecutor(channel.guild, AuditLogEvent.ChannelDelete, channel.id);
    await send(channel.guild, {
      title: 'salon supprimé',
      description: `nom : ${channel.name}${exec ? ` · par : <@${exec.id}>` : ''}`,
      color: colors.error,
    });
  },
};
