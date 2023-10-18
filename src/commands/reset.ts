import { SlashCommandBuilder } from 'discord.js';

import { Chat } from '../dto/chat.js';

export const reset = {
  data: new SlashCommandBuilder().setName('reset').setDescription('Reset chat history'),
  execute: async (interaction: any, chat: Chat) => {
    chat.reset()
    interaction.reply('Reset chat history successfully!');
  },
};
