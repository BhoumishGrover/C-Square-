import { sendEmail } from '../utils/email.js';

export const submitContactForm = async (req, res) => {
  const { name, email, company, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    await sendEmail({ name, email, company, subject, message });
    res.json({ success: true });
  } catch (err) {
    console.error('Contact form error', err);
    res.status(500).json({ error: 'Unable to send message right now' });
  }
};
