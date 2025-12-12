import type { TelegramApiResponse, TelegramFile } from '../types/telegram.js';

export class TelegramService {
  private baseUrl: string;

  constructor(private botToken: string) {
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  async sendMessage(
    chatId: number,
    text: string,
    replyToMessageId?: number
  ): Promise<void> {
    const payload: Record<string, any> = {
      chat_id: chatId,
      text: text,
    };

    if (replyToMessageId) {
      payload.reply_to_message_id = replyToMessageId;
    }

    const response = await fetch(`${this.baseUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  async getFileUrl(fileId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/getFile?file_id=${fileId}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get file: ${error}`);
    }

    const data = (await response.json()) as TelegramApiResponse<TelegramFile>;

    if (!data.ok || !data.result.file_path) {
      throw new Error('Invalid file response from Telegram API');
    }

    return `https://api.telegram.org/file/bot${this.botToken}/${data.result.file_path}`;
  }
}
