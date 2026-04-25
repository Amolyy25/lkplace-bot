const { isStaff } = require('./permissions');
const { check } = require('./rateLimit');
const { resolveUser, resolveMember } = require('./parseUser');
const { doBan, doKick, doMute, doWarn } = require('./modCore');
const { error, success, caseFooter, neutral } = require('./embed');
const { labelFor, buildReasonRow, DURATIONS } = require('./reasonSelect');
const pendingMod = require('./pendingMod');

function composeReason(categoryKey, extra, repliedContent) {
  const parts = [labelFor(categoryKey)];
  if (extra) parts.push(extra);
  if (repliedContent) parts.push(`(message cité : "${repliedContent}")`);
  return parts.join(' · ');
}

async function handleReasonSelect(interaction) {
  const pendingId = interaction.customId.split(':')[1];
  const data = pendingMod.get(pendingId);

  if (!data) {
    return interaction.update({ embeds: [error('expiré', 'demande invalide ou expirée')], components: [] });
  }
  if (interaction.user.id !== data.moderatorId) {
    return interaction.reply({ embeds: [error('refusé', 'seul le modérateur initial peut confirmer')], ephemeral: true });
  }
  if (!isStaff(interaction.member)) {
    return interaction.update({ embeds: [error('accès refusé', 'réservé au staff')], components: [] });
  }

  const quota = check(interaction.user.id, data.action);
  if (!quota.ok) {
    return interaction.update({ embeds: [error('quota atteint', `limite de /${data.action} par heure atteinte`)], components: [] });
  }

  const reason = composeReason(interaction.values[0], data.extraReason, data.repliedContent);

  try {
    let res, embed;
    switch (data.action) {
      case 'ban': {
        const user = await resolveUser(interaction.client, data.targetId);
        if (!user) throw new Error('utilisateur introuvable');
        res = await doBan(interaction.guild, { targetUser: user, reason, moderator: interaction.user });
        embed = success('membre banni', `<@${user.id}> · raison : ${reason}`);
        break;
      }
      case 'kick': {
        const member = await resolveMember(interaction.guild, data.targetId);
        if (!member) throw new Error('membre introuvable');
        res = await doKick(interaction.guild, { targetMember: member, reason, moderator: interaction.user });
        embed = success('membre exclu', `<@${member.id}> · raison : ${reason}`);
        break;
      }
      case 'mute': {
        const member = await resolveMember(interaction.guild, data.targetId);
        if (!member) throw new Error('membre introuvable');
        res = await doMute(interaction.guild, {
          targetMember: member, reason, moderator: interaction.user,
          durationMs: data.durationMs, durationLabel: data.durationLabel,
        });
        embed = success('membre mute', `<@${member.id}> · durée : ${data.durationLabel} · raison : ${reason}`);
        break;
      }
      case 'warn': {
        const user = await resolveUser(interaction.client, data.targetId);
        if (!user) throw new Error('utilisateur introuvable');
        res = await doWarn(interaction.guild, { targetUser: user, reason, moderator: interaction.user });
        embed = success('avertissement', `<@${user.id}> · raison : ${reason}`);
        break;
      }
      default:
        throw new Error('action inconnue');
    }
    embed.setFooter({ text: caseFooter(res.caseId) });
    await interaction.update({ embeds: [embed], components: [] });
  } catch (e) {
    await interaction.update({ embeds: [error('échec', e.message)], components: [] });
  } finally {
    pendingMod.del(pendingId);
  }
}

async function handleDurationSelect(interaction) {
  const pendingId = interaction.customId.split(':')[1];
  const data = pendingMod.get(pendingId);

  if (!data) {
    return interaction.update({ embeds: [error('expiré', 'demande invalide ou expirée')], components: [] });
  }
  if (interaction.user.id !== data.moderatorId) {
    return interaction.reply({ embeds: [error('refusé', 'seul le modérateur initial peut confirmer')], ephemeral: true });
  }

  const ms = Number(interaction.values[0]);
  const duration = DURATIONS.find(d => d.value === interaction.values[0]);
  
  data.durationMs = ms;
  data.durationLabel = duration?.label || `${ms}ms`;
  pendingMod.set(pendingId, data);

  await interaction.update({
    embeds: [neutral('Mute · Choix de la raison', `Cible : <@${data.targetId}> · Durée : ${data.durationLabel}`)],
    components: [buildReasonRow(pendingId)],
  });
}

module.exports = { handleReasonSelect, handleDurationSelect };
