const { send } = require('../utils/serverLog');
const { colors } = require('../config');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const member = newState.member || oldState.member;
    if (!member) return;

    const oldCh = oldState.channelId;
    const newCh = newState.channelId;
    if (oldCh === newCh) return;

    let title, description, color;
    if (!oldCh && newCh) {
      title = 'vocal rejoint';
      description = `<@${member.id}> a rejoint <#${newCh}>`;
      color = colors.success;
    } else if (oldCh && !newCh) {
      title = 'vocal quitté';
      description = `<@${member.id}> a quitté <#${oldCh}>`;
      color = colors.error;
    } else {
      title = 'vocal changé';
      description = `<@${member.id}> : <#${oldCh}> → <#${newCh}>`;
      color = colors.warning;
    }

    await send(newState.guild, { title, description, color });
  },
};
