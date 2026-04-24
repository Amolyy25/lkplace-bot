const { query } = require('../../utils/db');
const { neutral } = require('../../utils/embed');

module.exports = {
  name: 'leaderboard',
  aliases: ['lb', 'top'],
  async execute(message) {
    const res = await query(
      'SELECT user_id, level, xp FROM user_levels ORDER BY level DESC, xp DESC LIMIT 10'
    );

    if (res.rows.length === 0) {
      return message.reply({ embeds: [neutral('Classement', 'Aucun utilisateur n\'est encore enregistré.')] });
    }

    const lines = [];
    for (let i = 0; i < res.rows.length; i++) {
      const row = res.rows[i];
      const user = await message.client.users.fetch(row.user_id).catch(() => null);
      const tag = user ? user.username : `ID: ${row.user_id}`;
      lines.push(`**${i + 1}.** ${tag} · Niveau **${row.level}** (${row.xp} XP)`);
    }

    const embed = neutral('Classement des Niveaux', lines.join('\n'))
      .setThumbnail(message.guild.iconURL());

    await message.reply({ embeds: [embed] });
  },
};
