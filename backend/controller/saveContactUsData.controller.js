const nodemailer = require('nodemailer');
const { getDb } = require('../mongoDb');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || 'true') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

async function sendContactEmails({ name, email, subject, message }) {
  const mailer = getTransporter();
  const adminEmail = process.env.SMTP_USER;

  await mailer.sendMail({
    from: `Portfolio Contact <${process.env.SMTP_USER}>`,
    to: adminEmail,
    replyTo: email,
    subject: `New portfolio contact: ${subject}`,
    text: [
      'You received a new contact form submission.',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      '',
      message
    ].join('\n')
  });

  await mailer.sendMail({
    from: `Balaji Portfolio <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Thanks for reaching out, ${name}!`,
    text: [
      `Hi ${name},`,
      '',
      'Your message has been received successfully. I will get back to you soon.',
      '',
      `Subject: ${subject}`,
      `Message: ${message}`,
      '',
      'Thanks,',
      'Balaji'
    ].join('\n')
  });
}

exports.saveContactUsData = async (req, res) => {
  const db = getDb();
  const collection = db.collection('contactUsData');

  const { name, email, subject, message } = req.body;
  const data = { name, email, subject, message, createdAt: new Date() };

  // Persist first: a failing SMTP server must never lose a lead.
  const result = await collection.insertOne(data);

  sendContactEmails(data).catch((error) => {
    console.error('[mail] contact notification failed:', error.message);
  });

  return res.status(201).json({
    success: true,
    message: 'Contact form submitted successfully',
    id: result.insertedId
  });
};
