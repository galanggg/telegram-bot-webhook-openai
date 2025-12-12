# Telegram Bot with OpenAI on Vercel

A serverless Telegram bot built with Fastify and deployed on Vercel. The bot uses OpenAI to generate intelligent responses and supports both text and image (vision) capabilities.

## Features

- **Text Responses**: Uses GPT-4o-mini for fast, cost-effective text conversations
- **Vision Support**: Automatically switches to GPT-4o when users send images
- **Serverless**: Runs on Vercel with zero infrastructure management
- **TypeScript**: Fully typed for better development experience
- **Stateless**: No database required, processes each message independently

## Project Structure

```
gig-radar-test/
├── api/
│   └── webhook.ts                    # Main serverless endpoint
├── src/
│   ├── types/
│   │   └── telegram.ts              # Telegram API types
│   ├── services/
│   │   ├── telegram.service.ts      # Telegram API client
│   │   └── openai.service.ts        # OpenAI client
│   └── utils/
│       └── message-transformer.ts   # Message format transformer
├── package.json
├── tsconfig.json
└── vercel.json
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the instructions
3. Copy the bot token provided by BotFather

### 3. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key from your account settings
3. Copy the API key

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
OPENAI_API_KEY=your_openai_api_key
```

## Development

### Local Testing

```bash
npm run dev
```

This starts a local Vercel dev server. To test the webhook locally:

1. Install ngrok: `npm install -g ngrok`
2. Run ngrok: `ngrok http 3000`
3. Set webhook (replace with your ngrok URL and bot token):

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-ngrok-url.ngrok.io/api/webhook"
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI (if not already installed):

```bash
npm install -g vercel
```

2. Deploy:

```bash
npm run deploy
```

3. Set environment variables in Vercel:

```bash
vercel env add TELEGRAM_BOT_TOKEN
vercel env add OPENAI_API_KEY
```

Or set them in the Vercel dashboard under Project Settings → Environment Variables.

### Set Webhook URL

After deployment, set your Telegram webhook to point to your Vercel URL:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/webhook"
```

Replace:
- `<YOUR_BOT_TOKEN>` with your actual bot token
- `your-app.vercel.app` with your Vercel deployment URL

### Verify Webhook

Check if the webhook is set correctly:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## Usage

### Text Messages

Simply send any text message to your bot on Telegram. The bot will respond using GPT-4o-mini.

### Images (Vision)

1. Send an image to your bot
2. Optionally add a caption asking about the image
3. The bot will use GPT-4o with vision to analyze and respond

## How It Works

1. **Webhook**: Telegram sends updates to `/api/webhook` endpoint
2. **Message Processing**:
   - Extracts the message from the update
   - Checks if message contains an image
   - Selects appropriate model (gpt-4o-mini for text, gpt-4o for images)
3. **Image Handling** (if applicable):
   - Downloads image file URL from Telegram
   - Includes it in the OpenAI API request
4. **Response Generation**:
   - Calls OpenAI with the message content
   - Sends the AI response back to Telegram

## Architecture Decisions

### Why Current Message Only?

The bot processes only the current message without maintaining conversation history. This design:
- Keeps the implementation simple and stateless
- Works perfectly with serverless functions
- Avoids the complexity of state management
- Reduces API calls to Telegram

### Model Selection

- **GPT-4o-mini**: Fast and cost-effective for text-only messages
- **GPT-4o**: Powerful vision capabilities when images are present

## Troubleshooting

### Bot not responding

1. Check webhook status:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

2. Check Vercel logs:
```bash
vercel logs
```

3. Verify environment variables are set in Vercel dashboard

### Image not processing

Make sure the image is sent as a photo (not as a file). The bot processes photo messages, not document uploads.

### Type errors during build

Run type checking:
```bash
npm run type-check
```

## Scripts

- `npm run dev` - Start local development server
- `npm run build` - Compile TypeScript
- `npm run deploy` - Deploy to Vercel production
- `npm run type-check` - Check TypeScript types

## License

ISC
