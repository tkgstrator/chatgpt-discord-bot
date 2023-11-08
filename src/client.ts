import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';

import { model } from './commands/model.js';
import { reset } from './commands/reset.js';
import { rule } from './commands/rule.js';
import { status } from './commands/status.js';
import { Configuration } from './configuration.js';
import { Chat } from './dto/chat.js';
import { Command } from './dto/command.js';
import { Model } from './model.js';

export class AIClient {
  /**
   * ディスコードのトークン
   */
  private readonly token: string;
  /**
   * 反応するサーバー
   */
  private readonly guild_id: string;
  /**
   * BotのID
   */
  private readonly application_id: string;
  /**
   * 反応するチャンネル
   */
  private readonly channel_id: string;
  /**
   * ディスコードクライアント
   */
  private readonly client: Client;
  /**
   * ユーザーごとのチャット履歴
   */
  private readonly chats: Chat[];

  constructor() {
    const config: Configuration = new Configuration();
    this.token = config.token;
    this.guild_id = config.guild_id;
    this.application_id = config.application_id;
    this.channel_id = config.channel_id;
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });
    this.chats = [];
    /**
     * スラッシュコマンド登録
     */
    const commaneds = [model.data, status.data, reset.data, rule.data].map((command) => command.toJSON());
    const rest = new REST({ version: '10' }).setToken(this.token);
    rest
      .put(Routes.applicationGuildCommands(this.application_id, this.guild_id), {
        body: commaneds,
      })
      .then(() => {
        /**
         * コマンド登録完了
         */
        console.log('Commands registration is successfully!');
      });
    this.client.once(Events.ClientReady, () => {
      /**
       * ディスコードクライアントの準備完了
       */
      console.log('Client is ready');
    });
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      if (interaction.commandName === Command.MODEL) {
        const authorId: string = interaction.user.id;
        const model: Model = this.getModel(interaction.options.getString('model'));
        this.changeModel(authorId, model);
        interaction.reply({ content: 'Change model successfuly!' });
      }
      if (interaction.commandName === Command.RESET) {
        const chat: Chat = this.getChatByAuthorId(interaction.user.id);
        reset.execute(interaction, chat);
      }
      if (interaction.commandName === Command.STATUS) {
        const authorId: string = interaction.user.id;
        const chat: Chat = this.getChatByAuthorId(authorId);
        status.execute(interaction, chat);
      }
      if (interaction.commandName === Command.RULE) {
        const authorId: string = interaction.user.id;
        const chat: Chat = this.getChatByAuthorId(authorId);
        rule.execute(interaction, chat);
      }
    });
    this.client.on(Events.MessageCreate, async (message) => {
      /**
       * Botには反応しない
       */
      if (message.author.bot) return;
      /**
       * 知らないチャンネルには反応しない
       */
      if (message.channelId !== this.channel_id) return;
      /**
       * 自身へのリプライにだけ反応する
       */
      if (message.mentions.users.map((user) => user.id).includes(this.application_id)) {
        /**
         * 送信してきたユーザーのチャット履歴を取得する
         */
        const chat: Chat = this.getChatByAuthorId(message.author.id);
        chat.ask(message);
      }
    });
  }

  /**
   * チャットを検索し、なければ作成する
   * @param authorId
   * @returns
   */
  getChatByAuthorId(authorId: string): Chat {
    const chat: Chat | undefined = this.chats.find((chat) => chat.authorId === authorId);
    if (chat === undefined) {
      const chat: Chat = new Chat(authorId);
      this.chats.push(chat);
      return chat;
    }
    return chat;
  }

  private getModel(modelName: string | null): Model {
    return Object.values(Model).find((model) => model === modelName) ?? Model.GPT35_16K_1106;
  }

  /**
   * モデル切り替え
   * @param authorId
   * @param model
   */
  changeModel(authorId: string, model: Model) {
    const chat: Chat = this.getChatByAuthorId(authorId);
    chat.change(model);
  }

  reset(authorId: string) {
    const chat: Chat = this.getChatByAuthorId(authorId);
    chat.reset();
  }

  async login() {
    this.client.login(this.token);
  }
}
