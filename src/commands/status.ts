import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { Chat } from '../dto/chat.js';

export const status = {
  data: new SlashCommandBuilder().setName('status').setDescription('Get status'),
  execute: async (interaction: any, chat: Chat) => {
    const content = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('Current Status')
      .setDescription('Current user status')
      .addFields(
        {
          inline: true,
          name: 'model',
          value: chat.model,
        },
        {
          inline: true,
          name: 'usage',
          value: chat.usage.toLocaleString('en-US', { currency: 'USD', minimumFractionDigits: 5, style: 'currency' }),
        },
      );
    interaction.reply({ embeds: [content] });
  },
};
