import * as dotenv from 'dotenv';

dotenv.config();

export class Configuration {
  readonly token: string;
  readonly guild_id: string;
  readonly application_id: string;
  readonly channel_id: string;
  readonly api_key: string;

  constructor() {
    if (
      process.env.DISCORD_TOKEN === undefined ||
      process.env.GUILD_ID === undefined ||
      process.env.APPLICATION_ID === undefined ||
      process.env.CHATGPT_API_KEY === undefined ||
      process.env.CHANNEL_ID === undefined
    ) {
      throw new Error('Environment variables are not set');
    }
    this.token = process.env.DISCORD_TOKEN;
    this.guild_id = process.env.GUILD_ID;
    this.application_id = process.env.APPLICATION_ID;
    this.api_key = process.env.CHATGPT_API_KEY;
    this.channel_id = process.env.CHANNEL_ID;
  }
}
