import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import * as dotenv from 'dotenv';
import 'reflect-metadata';

export class DiscordConfig {
  @IsString()
  readonly token: string;

  @IsString()
  readonly guild_id: string;

  @IsString()
  readonly application_id: string;

  @IsString()
  readonly channel_id: string;

  @IsString()
  readonly api_key: string;
}

export const config: DiscordConfig = (() => {
  dotenv.config();

  const configuration = plainToInstance(
    DiscordConfig,
    {
      api_key: process.env.CHATGPT_API_KEY,
      application_id: process.env.DISCORD_APPLICATION_ID,
      channel_id: process.env.DISCORD_CHANNEL_ID,
      guild_id: process.env.DISCORD_GUILD_ID,
      token: process.env.DISCORD_BOT_TOKEN,
    },
    { enableImplicitConversion: true },
  );
  const errors = validateSync(configuration, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return configuration;
})();
