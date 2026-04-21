const { resolveUser } = require('../../utils/parseUser');
const { countFor } = require('../../utils/inviteTracker');
const { neutral, error } = require('../../utils/embed');
const db = require('../../utils/db');

module.exports = {
  name: 'invites',
  aliases: ['invitations'],
  async execute(message, args) {
    if (!db.available()) {
      return message.reply({ embeds: [error('db indisponible', 'persistance désactivée')] });
    }
    const arg = args[0];
    const user = arg ? await resolveUser(message.client, arg) : message.author;
    if (!user) return message.reply({ embeds: [error('cible invalide', 'mention ou ID incorrect')] });

    const stats = await countFor(user.id);
    const embed = neutral(
      `invitations · ${user.tag}`,
      `<@${user.id}> a **${stats.active}** invitation(s) active(s) · ${stats.total} total · ${stats.left} parti(s)`
    );
    await message.reply({ embeds: [embed] });
  },
};
