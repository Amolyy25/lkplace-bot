const { isStaff } = require('../../utils/permissions');
const { resolveUser } = require('../../utils/parseUser');
const { listForUser, countForUser, formatDate, TYPE_LABEL } = require('../../utils/sanctionsQueries');
const { neutral, error } = require('../../utils/embed');
const db = require('../../utils/db');

module.exports = {
  name: 'sanctions',
  aliases: ['history', 'historique'],
  async execute(message, args) {
    if (!isStaff(message.member)) {
      return message.reply({ embeds: [error('accès refusé', 'réservé au staff')] });
    }
    if (!db.available()) {
      return message.reply({ embeds: [error('db indisponible', 'persistance désactivée')] });
    }
    const user = await resolveUser(message.client, args.shift());
    if (!user) return message.reply({ embeds: [error('cible invalide', 'mention ou ID incorrect')] });

    const [rows, counts] = await Promise.all([listForUser(user.id, 10), countForUser(user.id)]);
    if (!rows?.length) {
      return message.reply({ embeds: [neutral(`sanctions · ${user.tag}`, 'aucun historique')] });
    }

    const lines = rows.map(r => {
      const t = TYPE_LABEL[r.type] || r.type;
      const dur = r.duration_label ? ` · ${r.duration_label}` : '';
      const reason = r.reason ? ` — ${r.reason.slice(0, 80)}` : '';
      return `\`#${r.id}\` · ${t}${dur} · ${formatDate(r.created_at)}${reason}`;
    });

    const summary = counts.map(c => `${TYPE_LABEL[c.type] || c.type}:${c.n}`).join(' · ');
    const embed = neutral(`sanctions · ${user.tag}`, lines.join('\n'))
      .setThumbnail(user.displayAvatarURL({ size: 128 }))
      .setFooter({ text: `total — ${summary}` });

    await message.reply({ embeds: [embed] });
  },
};
