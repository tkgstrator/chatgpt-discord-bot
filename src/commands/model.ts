import { SlashCommandBuilder } from 'discord.js'

import { Model } from '../enum/model'

export const model = {
  data: new SlashCommandBuilder()
    .setName('model')
    .setDescription('Change LLM model')
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription('LLM model')
        .setRequired(true)
        .setChoices(
          ...Object.entries(Model).map(([key, value]) => {
            return {
              name: key,
              value: value,
            }
          }),
        ),
    ),
  execute: async (interaction: any): Promise<Model> => {
    const model: Model = Object.values(Model).find((model) => model === interaction.options.getString('model')) ?? Model.GPT35_16K_1106
    await interaction.reply(`Change model to ${model} successfully`)
    return model
  },
}
