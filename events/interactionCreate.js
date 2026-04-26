const muteCmd = require('../commands/slash/mute');
const gostpingCmd = require('../commands/slash/gostping');
const { openTicket, claimTicket, closeTicket } = require('../utils/ticketActions');
const { handleReasonSelect, handleDurationSelect } = require('../utils/reasonHandler');
const { handleEmbedButton, handleEmbedModal, handleEmbedChannelSelect } = require('../utils/embedBuilderHandler');
const { error } = require('../utils/embed');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return;
        return await cmd.execute(interaction);
      }

      if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modal:embed:')) return handleEmbedModal(interaction);
      }

      if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith('mute:')) return muteCmd.handleSelect(interaction);
        if (interaction.customId === 'gostping:delay') return gostpingCmd.handleDelay(interaction);
        if (interaction.customId.startsWith('duration:')) return handleDurationSelect(interaction);
        if (interaction.customId.startsWith('reason:')) return handleReasonSelect(interaction);
      }

      if (interaction.isChannelSelectMenu()) {
        if (interaction.customId === 'gostping:channels') return gostpingCmd.handleChannels(interaction);
        if (interaction.customId === 'embed:select_channel') return handleEmbedChannelSelect(interaction);
      }

      if (interaction.isButton()) {
        const id = interaction.customId;
        if (id.startsWith('embed:')) return handleEmbedButton(interaction);
        if (id.startsWith('ticket:open:')) return openTicket(interaction, id.split(':')[2]);
        if (id.startsWith('ticket:claim:')) return claimTicket(interaction);
        if (id.startsWith('ticket:close:')) return closeTicket(interaction);
      }
    } catch (err) {
      console.error('interactionCreate error:', err);
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ embeds: [error('erreur', 'une erreur est survenue')], ephemeral: true }).catch(() => {});
      }
    }
  },
};
