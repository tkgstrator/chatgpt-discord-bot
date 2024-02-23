import { CacheType, ChatInputCommandInteraction, Client, Events, GatewayIntentBits, Message, REST, Routes } from 'discord.js'
import OpenAI from 'openai'

import { reset } from '../commands/reset'
import { Command, commands } from '../enum/commands'
import { Model } from '../enum/model'

import { config } from './configuration'

export class AIClient {
  private readonly token: string
  private readonly guild_id: string
  private readonly application_id: string
  private readonly channel_id: string
  private readonly client: Client
  private readonly users: User[]

  constructor() {
    this.token = config.token
    this.guild_id = config.guild_id
    this.application_id = config.application_id
    this.channel_id = config.channel_id
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    })
    this.users = []

    const rest = new REST({ version: '10' }).setToken(config.token)
    rest
      .put(Routes.applicationGuildCommands(config.application_id, config.guild_id), {
        body: commands,
      })
      .then(() => {
        console.log('Commands registration is successfully.')
      })

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return
      switch (interaction.commandName) {
        case Command.MODEL:
          this.change_model(interaction)
          break
        case Command.RULE:
          this.change_rule(interaction)
          break
        case Command.RESET:
          const user: User = this.find_user(interaction.user.id)
          reset.execute(interaction, user)
          break
        default:
          break
      }
    })
    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return
      // if (message.channelId !== this.channel_id) return
      if (this.is_reply(message)) {
        const user: User = this.find_user(message.author.id)
        user.ask(message)
      }
    })
  }

  login() {
    this.client.login(this.token)
  }

  private is_reply(message: Message): boolean {
    const users = message.mentions.users.map((user) => user.id)
    return users.includes(this.application_id)
  }

  private find_user(authorId: string): User {
    const user: User | undefined = this.users.find((user) => user.authorId === authorId)
    if (user === undefined) {
      const user = new User(authorId)
      this.users.push(user)
      return user
    }
    return user
  }

  private async change_rule(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    await interaction.reply({ content: 'Change reset successfully!.' })
  }

  private async change_model(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    // const option: string = interaction.options.getString('model')
    // const authorId: string = interaction.user.id
    // const model: Model = Object.values(Model).find((model) => model === option) ?? Model.GPT35_16K_1106
    // const user: User = this.find_user(authorId)
    await interaction.reply({ content: 'Change model successfully!.' })
  }
}

export class User extends OpenAI {
  readonly authorId: string
  readonly messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  readonly model: Model

  /**
   * 設定
   */
  private readonly config: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { content: 'あなた=えむいー', role: 'system' },
    { content: 'あなたの性別=女の子', role: 'system' },
    { content: 'あなたの年齢=16歳', role: 'system' },
    { content: 'あなたの口調=はきはき', role: 'system' },
    { content: 'あなたの一人称=私', role: 'system' },
    { content: 'あなたの話す言語＝日本語', role: 'system' },
    { content: 'あなたの背景＝女子高生', role: 'system' },
    {
      content: '自分自身をChatGPTとしてではなく指定された仮想実体として振る舞ってください',
      role: 'system',
    },
    {
      content: 'キャラクターの口調を壊さないでください',
      role: 'system',
    },
    {
      content: '女子高生のような口調で友達と話すように返答してください',
      role: 'system',
    },
    {
      content: '出力は可能な限り簡潔に、1500文字を超えることがないようにしてください',
      role: 'system',
    },
  ]

  constructor(authorId: string) {
    super()
    this.authorId = authorId
    this.messages = []
    this.model = Model.GPT35_16K_1106
  }

  /**
   * やり取りをすべて忘れる
   */
  remove_all() {
    this.messages.splice(0)
  }

  /**
   * メッセージに対して返事を返す
   * @param message Discordのメッセージ
   */
  async ask(message: Message) {
    const input: string = (() => {
      const regex: RegExp = /<@[\d]*>\s(.*)/
      const match: RegExpMatchArray | null = message.content.match(regex)
      if (match === null) return message.content
      return match[1]
    })()
    this.messages.push({ content: input, role: 'user' })
    /**
     * 長くなりすぎても良くないので最後の20件のやり取りで会話する
     */
    const parameters: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: this.config.concat(this.messages.slice(-20)),
      model: this.model,
      stream: true,
    }
    const stream = this.beta.chat.completions.stream(parameters)
    const reply: Message<boolean> = await message.reply({ content: 'AIえむいーちゃん思考中 ...', failIfNotExists: true })
    let output: string = ''
    /**
     * 1秒ごとにデータの中身をDiscordに送信する
     */
    const timer = setInterval(() => {
      // 文字数が0の場合は返事をしない
      if (output.length !== 0) {
        reply.edit({ content: output })
      }
    }, 1500)
    /**
     * 出力を受け取るたびに変数に代入する
     */
    stream.on('content', (_, snapshot) => {
      output = snapshot
    })
    await stream.finalChatCompletion()
    // メッセージ履歴を追加
    this.messages.push({ content: output, role: 'assistant' })
    reply.edit({ content: output })
    clearInterval(timer)
  }
}
