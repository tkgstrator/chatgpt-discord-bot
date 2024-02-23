import { SlashCommandBuilder } from 'discord.js'

import { Rule } from '../enum/rule'

export const rule = {
  data: new SlashCommandBuilder()
    .setName('rule')
    .setDescription('Change chat rule')
    .addStringOption((option) =>
      option
        .setName('rule')
        .setDescription('Change the default charachter of ChatGPT')
        .setRequired(true)
        .setChoices(
          ...Object.entries(Rule).map(([key, value]) => {
            return {
              name: key,
              value: value,
            }
          }),
        ),
    ),
  execute: async (interaction: any): Promise<Rule> => {
    const rule: Rule = Object.values(Rule).find((rule) => rule === interaction.options.getString('rule')) ?? Rule.DEFAULT
    await interaction.reply(`Change rule successfully`)
    return rule
  },
}
