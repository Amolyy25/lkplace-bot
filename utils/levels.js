const { query } = require('./db');
const { roles } = require('../config');
const { neutral } = require('./embed');

const COOLDOWN = 60 * 1000;
const XP_MIN = 15;
const XP_MAX = 25;

function getXpNeeded(level) {
  return 5 * (level ** 2) + (50 * level) + 100;
}

async function handleMessage(message) {
  if (!message.guild || message.author.bot) return;

  const res = await query(
    'SELECT * FROM user_levels WHERE user_id = $1',
    [message.author.id]
  );

  let data = res.rows[0];
  const now = new Date();

  if (!data) {
    await query(
      'INSERT INTO user_levels (user_id, xp, level, last_xp_at) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO NOTHING',
      [message.author.id, 0, 0, new Date(0)]
    );
    // Fetch again or use defaults
    data = { user_id: message.author.id, xp: 0, level: 0, last_xp_at: new Date(0) };
  }

  const lastXpAt = new Date(data.last_xp_at);
  if (now - lastXpAt < COOLDOWN) return;

  const xpGain = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
  let newXp = data.xp + xpGain;
  let newLevel = data.level;

  let needed = getXpNeeded(newLevel);
  let leveledUp = false;

  while (newXp >= needed) {
    newXp -= needed;
    newLevel++;
    needed = getXpNeeded(newLevel);
    leveledUp = true;
  }

  await query(
    'UPDATE user_levels SET xp = $1, level = $2, last_xp_at = $3 WHERE user_id = $4',
    [newXp, newLevel, now, message.author.id]
  );

  if (leveledUp) {
    // Check for role rewards
    const levelRoles = roles.level || {};
    // Find if current level or any level below has a role that should be added
    // Usually we only add the one for the current level
    const roleId = levelRoles[newLevel];
    if (roleId) {
      await message.member.roles.add(roleId).catch(err => console.error(`[levels] Failed to add role ${roleId}:`, err.message));
    }

    const embed = neutral(
      'Nouveau Niveau Atteint',
      `Félicitations <@${message.author.id}> ! Tu viens de passer au **Niveau ${newLevel}**.\n\nContinue de participer pour débloquer de nouvelles récompenses !`
    );
    
    const levelMsg = await message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] }).catch(() => {});
    if (levelMsg) {
      setTimeout(() => levelMsg.delete().catch(() => {}), 10000);
    }
  }
}

module.exports = { handleMessage, getXpNeeded };
