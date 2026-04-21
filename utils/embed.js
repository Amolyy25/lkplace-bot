const { EmbedBuilder } = require('discord.js');
const { colors } = require('../config');

function base(color) {
  return new EmbedBuilder().setColor(color);
}

function neutral(title, description) {
  const e = base(colors.neutral);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  return e;
}

function success(title, description) {
  const e = base(colors.success);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  return e;
}

function error(title, description) {
  const e = base(colors.error);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  return e;
}

function warning(title, description) {
  const e = base(colors.warning);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  return e;
}

function caseFooter(caseId, date = new Date()) {
  const d = date.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  return caseId ? `cas #${caseId} · ${d}` : d;
}

module.exports = { neutral, success, error, warning, caseFooter };
