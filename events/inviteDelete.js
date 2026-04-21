const { removeInvite } = require('../utils/inviteTracker');

module.exports = {
  name: 'inviteDelete',
  async execute(invite) {
    if (!invite.guild) return;
    removeInvite(invite.guild, invite.code);
  },
};
