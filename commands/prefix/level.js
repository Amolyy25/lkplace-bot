const { query } = require('../../utils/db');
const { neutral, error } = require('../../utils/embed');
const { getXpNeeded } = require('../../utils/levels');
const { resolveUser } = require('../../utils/parseUser');

module.exports = {
  name: 'level',
  aliases: ['rank', 'lvl'],
  async execute(message, args) {
    const user = (await resolveUser(message.client, args[0])) || message.author;
    
    const res = await query(
      'SELECT * FROM user_levels WHERE user_id = $1',
      [user.id]
    );

    const data = res.rows[0];
    if (!data) {
      return message.reply({ embeds: [neutral(`Niveau · ${user.username}`, 'Cet utilisateur n\'a pas encore d\'expérience.')] });
    }

    const nextXp = getXpNeeded(data.level);
    const progress = Math.floor((data.xp / nextXp) * 100);
    
    // Create a simple text progress bar
    const totalBars = 10;
    const filledBars = Math.round((progress / 100) * totalBars);
    const bar = '■'.repeat(filledBars) + '□'.repeat(totalBars - filledBars);

    const embed = neutral(`Niveau · ${user.username}`, `Voici la progression actuelle de <@${user.id}> :`)
      .addFields(
        { name: 'Niveau', value: `**${data.level}**`, inline: true },
        { name: 'Expérience', value: `**${data.xp}** / ${nextXp} XP`, inline: true },
        { name: 'Progression', value: `${bar} (${progress}%)`, inline: false }
      )
      .setThumbnail(user.displayAvatarURL());

    await message.reply({ embeds: [embed] });
  },
};
