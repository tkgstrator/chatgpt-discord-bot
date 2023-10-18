import { SlashCommandBuilder } from 'discord.js';

import { Chat } from '../dto/chat.js';

export enum Rule {
  ADD = 'add',
  SET = 'set',
}

export const rule = {
  data: new SlashCommandBuilder()
    .setName('rule')
    .setDescription('Set system rule')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('The mode of rule')
        .setRequired(true)
        .addChoices(
          ...Object.entries(Rule).map(([key, value]) => {
            return {
              name: key,
              value: value,
            };
          }),
        ),
    )
    .addStringOption((option) =>
      option.setName('prompt').setDescription('The prompt to be followed by ChatGPT').setRequired(true),
    ),
  execute: async (interaction: any, chat: Chat) => {
    const prompt: string | undefined = interaction.options.getString('prompt');
    const rule: Rule = Object.values(Rule).find((rule) => rule === interaction.options.getString('mode')) ?? Rule.SET;
    switch (rule) {
      case Rule.ADD:
        if (prompt !== undefined) {
          chat.prefix.push({ content: prompt, role: 'system' });
        }
        break;
      case Rule.SET:
        if (prompt !== undefined) {
          chat.prefix = [{ content: prompt, role: 'system' }];
        }
        break;
    }
    interaction.reply('Set prompt successfully!');
  },
};
