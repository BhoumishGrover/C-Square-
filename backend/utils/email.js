import { google } from 'googleapis'

let gmailClient
let fromAddress
let fromName
let toAddress

const configureGmail = () => {
  const {
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN,
    GMAIL_REDIRECT_URI = 'https://developers.google.com/oauthplayground',
    GMAIL_FROM,
    GMAIL_FROM_NAME,
    CONTACT_TO,
  } = process.env

  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    throw new Error('GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN must be set in .env')
  }

  if (!GMAIL_FROM) {
    throw new Error('GMAIL_FROM must be set in .env')
  }

  if (!CONTACT_TO) {
    throw new Error('CONTACT_TO must be set in .env')
  }

  fromAddress = GMAIL_FROM
  fromName = GMAIL_FROM_NAME || 'C-Square'
  toAddress = CONTACT_TO

  const oauth2Client = new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI)
  oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN })
  gmailClient = google.gmail({ version: 'v1', auth: oauth2Client })
}

const ensureConfigured = () => {
  if (!gmailClient) {
    configureGmail()
  }
}

const buildEmailBody = ({ name, email, company, subject, message }) => {
  const sanitizedMessage = String(message).replace(/\r?\n/g, '<br />')
  const htmlSections = [
    '<h2>New contact form submission</h2>',
    `<p><strong>Name:</strong> ${name}</p>`,
    `<p><strong>Email:</strong> ${email}</p>`,
  ]

  if (company) {
    htmlSections.push(`<p><strong>Company:</strong> ${company}</p>`)
  }

  htmlSections.push('<hr />', `<p>${sanitizedMessage}</p>`)

  const headers = [
    `From: ${fromName} <${fromAddress}>`,
    `To: ${toAddress}`,
    `Subject: New Contact: ${subject}`,
    `Reply-To: ${email}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
  ]

  const messageData = [...headers, htmlSections.join('\r\n')].join('\r\n')

  return Buffer.from(messageData)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export const sendEmail = async ({ name, email, company, subject, message }) => {
  ensureConfigured()

  if (!name || !email || !subject || !message) {
    throw new Error('name, email, subject, and message are required to send an email')
  }

  const raw = buildEmailBody({ name, email, company, subject, message })

  await gmailClient.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
}
