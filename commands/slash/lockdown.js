const { SlashCommandBuilder } = require('discord.js');
const { isAdmin } = require('../../utils/permissions');
const { enableLockdown, disableLockdown, state } = require('../../utils/antiRaid');
const { error, success, neutral } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Activer ou désactiver le mode lockdown.')
    .addStringOption(o =>
      o.setName('mode')
        .setDescription('on / off / status')
        .setRequired(true)
        .addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' }, { name: 'status', value: 'status' })
    ),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé aux admins')], ephemeral: true });
    }
    const mode = interaction.options.getString('mode');
    await interaction.deferReply({ ephemeral: true });

    if (mode === 'status') {
      return interaction.editReply({ embeds: [neutral('lockdown', state.lockdown ? 'actif' : 'inactif')] });
    }
    if (mode === 'on') {
      const ok = await enableLockdown(interaction.guild);
      return interaction.editReply({ embeds: [ok ? success('lockdown activé', 'envoi bloqué pour @everyone') : neutral('lockdown', 'déjà actif')] });
    }
    const ok = await disableLockdown(interaction.guild);
    return interaction.editReply({ embeds: [ok ? success('lockdown désactivé', 'envoi restauré') : neutral('lockdown', 'déjà inactif')] });
  },
};
