import { SlashCommandBuilder } from 'discord.js'

import { User } from '../utils/chatgpt'

export const reset = {
  data: new SlashCommandBuilder().setName('reset').setDescription('Reset chat history'),
  execute: async (interaction: any, user: User) => {
    user.remove_all()
    interaction.reply('Reset chat history successfully!')
  },
}
