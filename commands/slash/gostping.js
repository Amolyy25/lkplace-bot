const {
  SlashCommandBuilder, ActionRowBuilder,
  ChannelSelectMenuBuilder, StringSelectMenuBuilder, ChannelType,
} = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { setChannels, setDelay, getConfig } = require('../../utils/ghostping');
const { neutral, error, success } = require('../../utils/embed');

const DELAY_OPTIONS = [
  { label: '2 secondes', value: '2000' },
  { label: '5 secondes', value: '5000' },
  { label: '10 secondes', value: '10000' },
  { label: '30 secondes', value: '30000' },
  { label: '1 minute', value: '60000' },
  { label: 'jamais', value: '0' },
];

function labelForDelay(ms) {
  if (ms === 0) return 'jamais';
  return `${ms / 1000}s`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gostping')
    .setDescription('Configurer le ping automatique à l\'arrivée d\'un membre.'),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ embeds: [error('accès refusé', 'réservé au staff')], ephemeral: true });
    }

    const cfg = getConfig();
    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('gostping:channels')
      .setPlaceholder('salons où ping à l\'arrivée')
      .setChannelTypes(ChannelType.GuildText)
      .setMinValues(0)
      .setMaxValues(25);

    const delaySelect = new StringSelectMenuBuilder()
      .setCustomId('gostping:delay')
      .setPlaceholder('délai avant suppression')
      .addOptions(DELAY_OPTIONS);

    const description = `salons actifs : ${cfg.channels.length} · délai : ${labelForDelay(cfg.deleteAfterMs)}`;
    await interaction.reply({
      embeds: [neutral('ping d\'arrivée · configuration', description)],
      components: [new ActionRowBuilder().addComponents(channelSelect), new ActionRowBuilder().addComponents(delaySelect)],
      ephemeral: true,
    });
  },

  async handleChannels(interaction) {
    await setChannels(interaction.values);
    await interaction.reply({ embeds: [success('salons mis à jour', `${interaction.values.length} salon(s)`)], ephemeral: true });
  },

  async handleDelay(interaction) {
    const ms = Number(interaction.values[0]);
    await setDelay(ms);
    await interaction.reply({ embeds: [success('délai mis à jour', labelForDelay(ms))], ephemeral: true });
  },
};
