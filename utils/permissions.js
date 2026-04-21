const { PermissionFlagsBits } = require('discord.js');
const { roles } = require('../config');

function isStaff(member) {
  if (!member) return false;
  if (member.permissions?.has(PermissionFlagsBits.Administrator)) return true;
  return member.roles?.cache?.has(roles.staff);
}

function isAdmin(member) {
  return member?.permissions?.has(PermissionFlagsBits.Administrator);
}

module.exports = { isStaff, isAdmin };
