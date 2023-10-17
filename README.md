# ChatGPT Discord Bot

DiscordにChatGPTを利用して応答するBotを立てるためのソフトウェアです.

## 必要なもの

- NodeJS 18.17.1
- Yarn

## 環境設定

```zsh
git clone https://github.com/tkgstrator/chatgpt-discord-bot.git
cd chatgpt-discord-bot
cp .env.example .env
```

.envに以下の情報を設定します.

```zsh
CHATGPT_API_KEY=
DISCORD_TOKEN=
GUILD_ID=
APPLICATION_ID=
```

## 起動

```zsh
yarn install
yarn dev
```

### 使い方

メンションを飛ばすと反応してくれます.

### おまけ

より便利に利用したい場合はDockerを使うこともできます.
