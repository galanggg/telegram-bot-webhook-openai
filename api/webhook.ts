import type { VercelRequest, VercelResponse } from '@vercel/node';
import Fastify from 'fastify';
import type { TelegramUpdate } from '../src/types/telegram.js';
import { TelegramService } from '../src/services/telegram.service.js';
import { OpenAIService } from '../src/services/openai.service.js';
import { transformMessageToOpenAI } from '../src/utils/message-transformer.js';

const app = Fastify({ logger: true });

app.post('/', async (request, reply) => {
  try {
    const update = request.body as TelegramUpdate;

    console.log('Received update:', JSON.stringify(update, null, 2));

    const message = update.message;
    if (!message) {
      return reply.code(200).send({ ok: true });
    }

    console.log('Message object:', JSON.stringify(message, null, 2));

    const chatId = message.chat.id;
    const messageId = message.message_id;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!botToken || !openaiApiKey) {
      console.error('Missing required environment variables');
      return reply.code(200).send({ ok: true });
    }

    const telegramService = new TelegramService(botToken);
    const openAIService = new OpenAIService(openaiApiKey);

    // Check for images: either as photo array or as document with image mime type
    const hasPhotoArray = !!(message.photo && message.photo.length > 0);
    const hasImageDocument = !!(
      message.document &&
      message.document.mime_type?.startsWith('image/')
    );
    const hasImage = hasPhotoArray || hasImageDocument;
    const model = hasImage ? 'gpt-4o' : 'gpt-4o-mini';

    console.log('Processing message:', {
      hasImage,
      hasPhotoArray,
      hasImageDocument,
      model,
      photoCount: message.photo?.length || 0,
      documentMimeType: message.document?.mime_type,
      text: message.text,
      caption: message.caption
    });

    const userMessage = await transformMessageToOpenAI(
      message,
      telegramService,
      hasImage
    );

    console.log('Transformed message:', JSON.stringify(userMessage, null, 2));

    const response = await openAIService.generateResponse(
      [userMessage],
      model
    );

    console.log('OpenAI response:', response);

    await telegramService.sendMessage(chatId, response, messageId);

    return reply.code(200).send({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return reply.code(200).send({ ok: true });
  }
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  await app.ready();

  // Stringify body and calculate correct Content-Length
  const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // Filter out body-related headers and set correct Content-Length
  const headers = { ...req.headers };
  delete headers['content-length'];
  delete headers['transfer-encoding'];

  const response = await app.inject({
    method: req.method as any,
    url: '/',
    headers: {
      ...headers,
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(payload).toString(),
    },
    payload,
  });

  res.status(response.statusCode);
  Object.entries(response.headers).forEach(([key, value]) => {
    if (value !== undefined) {
      res.setHeader(key, value);
    }
  });
  res.send(response.body);
}
