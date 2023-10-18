import { Message } from 'discord.js';
import OpenAI from 'openai';
import { CompletionUsage } from 'openai/resources/completions.js';

import { Model } from '../model.js';

export class Chat {
  /**
   * 利用者ID
   */
  readonly authorId: string;
  /**
   * チャット履歴
   */
  readonly messages: OpenAI.Chat.Completions.ChatCompletionMessage[];
  /**
   * システムから指示された初期設定
   */
  prefix: OpenAI.Chat.Completions.ChatCompletionMessage[] = [
    { content: '女子高生のような口調で返事をしてください', role: 'system' },
  ];
  /**
   * 利用料
   */
  usage: number;
  /**
   * モデル
   */
  model: Model;
  /**
   * AI
   */
  private readonly openai: OpenAI;

  constructor(authorId: string) {
    this.authorId = authorId;
    this.messages = [];
    this.usage = 0;
    this.model = Model.GPT35_0613;
    this.openai = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });
  }

  /**
   * モデルを切り替えます
   *
   * @param model
   */
  change(model: Model) {
    this.model = model;
  }

  /**
   * 質問を履歴に追加します
   * @param message
   * @returns
   */
  async ask(message: Message) {
    /**
     * 正規表現で抽出した質問内容
     */
    const content: string = (() => {
      const regex: RegExp = /<@[\d]*>\s(.*)/;
      const match: RegExpMatchArray | null = message.content.match(regex);
      if (match === null) return message.content;
      return match[1];
    })();
    /**
     * 質問を追加
     */
    this.messages.push({ content: content, role: 'user' });
    message.channel.sendTyping();
    const timer = setInterval(() => {
      message.channel.sendTyping();
    }, 10000);
    const completion = await this.openai.chat.completions.create({
      messages: this.prefix.concat(this.messages.slice(-10)),
      model: this.model,
    });
    this.usage += this.calcPrice(completion.usage);
    const response: string | null = completion.choices[0].message.content;
    if (response === null) return;
    /**
     * 返事を追加
     */
    this.messages.push(completion.choices[0].message);
    clearInterval(timer);
    try {
      /**
       * 長すぎる返事は最初の1500文字だけ返す
       */
      if (response.length >= 1500) {
        message.reply(response.slice(0, 1500) + '...');
      } else {
        message.reply(response);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 利用料金を計算する
   * @param usage
   * @returns
   */
  private calcPrice(usage: CompletionUsage | undefined): number {
    if (usage === undefined) return 0;
    const input: number = (() => {
      switch (this.model) {
        case (Model.GPT35, Model.GPT35_0613):
          return 0.0015;
        case (Model.GPT35_16k, Model.GPT35_16k_0613):
          return 0.003;
        case (Model.GPT4, Model.GPT4_0613):
          return 0.03;
        // case (Model.GPT4_32k, Model.GPT4_32k_0613):
        //   return 0.06;
        default:
          return 0;
      }
    })();
    const output: number = (() => {
      switch (this.model) {
        case (Model.GPT35, Model.GPT35_0613):
          return 0.002;
        case (Model.GPT35_16k, Model.GPT35_16k_0613):
          return 0.004;
        case (Model.GPT4, Model.GPT4_0613):
          return 0.06;
        // case (Model.GPT4_32k, Model.GPT4_32k_0613):
        //   return 0.12;
        default:
          return 0;
      }
    })();
    return usage.prompt_tokens * input * 0.001 + usage.completion_tokens * output * 0.001;
  }

  /**
   * チャット履歴を削除する
   */
  reset() {
    this.messages.splice(0);
    this.prefix = [{ content: '女子高生のような口調で返事をしてください', role: 'system' }];
  }
}
