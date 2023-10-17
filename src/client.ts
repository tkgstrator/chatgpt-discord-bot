import { Client, Events, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';

import { Configuration } from './configuration.js';
import { Model } from './model.js';
import { plainToInstance } from 'class-transformer';
import { prompt } from './dan.js';

export class AIClient {
  private readonly token: string;
  private readonly guild_id: string;
  private readonly application_id: string;
  private readonly channel_id: string;
  private readonly client: Client;
  private readonly openai: OpenAI;

  constructor() {
    const config: Configuration = new Configuration();
    this.token = config.token;
    this.guild_id = config.guild_id;
    this.application_id = config.application_id;
    this.channel_id = config.channel_id;
    this.openai = new OpenAI({ apiKey: config.api_key });
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });
    this.client.once(Events.ClientReady, () => {
      console.log('Client is ready');
    });
    this.client.on(Events.MessageCreate, async (message) => {
      /**
       * Botには反応しない
       */
      if (message.author.bot) return;
      if (message.channelId !== this.channel_id) return;
      /**
       * 自身へのリプライにだけ反応する
       */
      if (message.mentions.users.map((user) => user.id).includes(this.application_id)) {
        /**
         * チャットを継続するためメッセージを追加する
         * 100以上の履歴は遡らない
         */
        this.messages.push({ content: message.content, role: 'user' })
        this.messages = this.params.concat(this.messages.slice(-100))
        const response = await this.openai.chat.completions.create({
          messages: this.messages,
          model: Model.GPT35Turbo0613,
        });
        console.log(response, response.choices);
        const content: string | null = response.choices[0].message.content;
        if (content !== null) {
          message.reply(content);
        }
      }
    });
  }

  /**
   * メッセージ履歴
   */
  private messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
  /**
   * システム設定
   */
  private params: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    "清楚な女子高生の口調で返事をしてください",
    // prompt
  ].map((content) => {
    return {
        content: content,
        role: 'system'
    }
  })

  async login() {
    this.client.login(this.token);
  }
}
