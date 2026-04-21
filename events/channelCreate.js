const { send } = require('../utils/serverLog');
const { fetchExecutor, AuditLogEvent } = require('../utils/auditLog');
const { colors } = require('../config');

module.exports = {
  name: 'channelCreate',
  async execute(channel) {
    if (!channel.guild) return;
    const exec = await fetchExecutor(channel.guild, AuditLogEvent.ChannelCreate, channel.id);
    await send(channel.guild, {
      title: 'salon créé',
      description: `${channel.toString()} · nom : ${channel.name}${exec ? ` · par : <@${exec.id}>` : ''}`,
      color: colors.success,
    });
  },
};
