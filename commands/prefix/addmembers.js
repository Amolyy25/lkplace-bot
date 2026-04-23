const { isStaff } = require('../../utils/permissions');
const { roles, colors } = require('../../config');
const { error, neutral, success } = require('../../utils/embed');

module.exports = {
  name: 'addmembers',
  async execute(message) {
    if (!isStaff(message.member)) {
      return message.reply({ embeds: [error('accès refusé', 'réservé au staff')] });
    }

    const roleId = roles.member;
    if (!roleId) {
      return message.reply({ embeds: [error('configuration manquante', 'le rôle membre n\'est pas défini dans la config')] });
    }

    const statusMsg = await message.reply({ embeds: [neutral('ajout des rôles', 'récupération des membres en cours...')] });

    try {
      const guild = message.guild;
      const members = await guild.members.fetch();
      const membersToUpdate = members.filter(m => !m.user.bot && !m.roles.cache.has(roleId));

      if (membersToUpdate.size === 0) {
        return statusMsg.edit({ embeds: [success('terminé', 'tous les membres ont déjà le rôle')] });
      }

      await statusMsg.edit({ embeds: [neutral('ajout des rôles', `ajout du rôle à ${membersToUpdate.size} membres...`)] });

      let count = 0;
      for (const [id, member] of membersToUpdate) {
        try {
          await member.roles.add(roleId);
          count++;
          // Update status every 25 members to show progress
          if (count % 25 === 0) {
            await statusMsg.edit({ embeds: [neutral('ajout des rôles', `progression : ${count}/${membersToUpdate.size}`)] });
          }
        } catch (err) {
          console.error(`[addmembers] failed for ${member.user.tag}:`, err.message);
        }
      }

      await statusMsg.edit({ embeds: [success('terminé', `le rôle a été ajouté à ${count} membres.`)] });
    } catch (err) {
      console.error('[addmembers] error:', err);
      await statusMsg.edit({ embeds: [error('erreur', 'une erreur est survenue lors de l\'ajout des rôles')] });
    }
  },
};
