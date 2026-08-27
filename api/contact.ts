import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateBrief, formatBriefMessage } from './_brief';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = validateBrief(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatBriefMessage(result.value),
        parse_mode: 'MarkdownV2',
      }),
    }
  );

  await response.text(); // drain connection for reuse

  if (!response.ok) {
    return res.status(502).json({ error: 'Telegram API error' });
  }

  return res.status(200).json({ ok: true });
}
