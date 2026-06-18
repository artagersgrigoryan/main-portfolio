import type { VercelRequest, VercelResponse } from '@vercel/node';

const escMd = (s: string) => s.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body ?? {};

  const nameStr = String(name ?? '').trim();
  const emailStr = String(email ?? '').trim();
  const messageStr = String(message ?? '').trim();

  if (!nameStr || !emailStr || !messageStr) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (nameStr.length > 100 || emailStr.length > 200 || messageStr.length > 3900) {
    return res.status(400).json({ error: 'Input too long' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const text =
    `📬 *New Contact Form Submission*\n\n` +
    `*Name:* ${escMd(nameStr)}\n` +
    `*Email:* ${escMd(emailStr)}\n` +
    `*Message:*\n${escMd(messageStr)}`;

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'MarkdownV2' }),
    }
  );

  await response.text(); // drain connection for reuse

  if (!response.ok) {
    return res.status(502).json({ error: 'Telegram API error' });
  }

  return res.status(200).json({ ok: true });
}
