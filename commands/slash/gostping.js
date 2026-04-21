const {
  SlashCommandBuilder, ActionRowBuilder,
  ChannelSelectMenuBuilder, StringSelectMenuBuilder, ChannelType,
} = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { setChannels, setDelay, getConfig } = require('../../utils/ghostping');
const { neutral, error, success } = require('../../utils/embed');

const DELAY_OPTIONS = [
  { label: '5 secondes', value: '5000' },
  { label: '10 secondes', value: '10000' },
  { label: '30 secondes', value: '30000' },
  { label: '1 minute', value: '60000' },
  { label: 'jamais', value: '0' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gostping')
    .setDescription('Configurer la détection de ghost pings.'),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé au staff')], ephemeral: true });
    }

    const cfg = getConfig();
    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('gostping:channels')
      .setPlaceholder('salons surveillés')
      .setChannelTypes(ChannelType.GuildText)
      .setMinValues(0)
      .setMaxValues(25);

    const delaySelect = new StringSelectMenuBuilder()
      .setCustomId('gostping:delay')
      .setPlaceholder('délai de suppression')
      .addOptions(DELAY_OPTIONS);

    const description = `salons actifs : ${cfg.channels.length} · délai : ${cfg.deleteAfterMs === 0 ? 'jamais' : cfg.deleteAfterMs / 1000 + 's'}`;
    await interaction.reply({
      embeds: [neutral('ghost ping · configuration', description)],
      components: [new ActionRowBuilder().addComponents(channelSelect), new ActionRowBuilder().addComponents(delaySelect)],
      ephemeral: true,
    });
  },

  async handleChannels(interaction) {
    await setChannels(interaction.values);
    await interaction.reply({ embeds: [success('salons mis à jour', `${interaction.values.length} salon(s) surveillé(s)`)], ephemeral: true });
  },

  async handleDelay(interaction) {
    const ms = Number(interaction.values[0]);
    await setDelay(ms);
    await interaction.reply({ embeds: [success('délai mis à jour', ms === 0 ? 'jamais' : `${ms / 1000}s`)], ephemeral: true });
  },
};
