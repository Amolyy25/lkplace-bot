const { addInvite } = require('../utils/inviteTracker');

module.exports = {
  name: 'inviteCreate',
  async execute(invite) {
    if (!invite.guild) return;
    addInvite(invite.guild, invite.code, invite.uses || 0);
  },
};
