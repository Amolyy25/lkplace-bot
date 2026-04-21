const { send } = require('../utils/serverLog');
const { colors } = require('../config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    await send(member.guild, {
      title: 'membre parti',
      description: `<@${member.id}> a quitté · tag : ${member.user?.tag || 'inconnu'}`,
      color: colors.error,
    });
  },
};
