import type { TelegramMessage } from '../types/telegram.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { TelegramService } from '../services/telegram.service.js';

export async function transformMessageToOpenAI(
  message: TelegramMessage,
  telegramService: TelegramService,
  includeImage: boolean
): Promise<ChatCompletionMessageParam> {
  const textContent = message.text || message.caption || '';

  if (!includeImage) {
    const role = message.from?.is_bot ? 'assistant' : 'user';
    return {
      role,
      content: textContent,
    };
  }

  // Get file_id from either photo array or document
  let fileId: string | undefined;

  if (message.photo && message.photo.length > 0) {
    // Image sent as photo (compressed)
    const largestPhoto = message.photo[message.photo.length - 1];
    fileId = largestPhoto.file_id;
  } else if (message.document && message.document.mime_type?.startsWith('image/')) {
    // Image sent as document/file (uncompressed)
    fileId = message.document.file_id;
  }

  if (!fileId) {
    // Fallback to text-only if no image found
    const role = message.from?.is_bot ? 'assistant' : 'user';
    return {
      role,
      content: textContent,
    };
  }

  const imageUrl = await telegramService.getFileUrl(fileId);

  return {
    role: 'user',
    content: [
      {
        type: 'text',
        text: textContent || 'What is in this image?',
      },
      {
        type: 'image_url',
        image_url: {
          url: imageUrl,
        },
      },
    ],
  };
}
