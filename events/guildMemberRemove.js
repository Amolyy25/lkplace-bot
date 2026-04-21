const { send } = require('../utils/serverLog');
const { colors } = require('../config');
const { recordLeave } = require('../utils/inviteTracker');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    await recordLeave(member.id);
    await send(member.guild, {
      title: 'membre parti',
      description: `<@${member.id}> a quitté · tag : ${member.user?.tag || 'inconnu'}`,
      color: colors.error,
    });
  },
};
