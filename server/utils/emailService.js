const nodemailer = require('nodemailer');

const hasSmtpConfig = () => (
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const createTransporter = () => {
  if (!hasSmtpConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMemberAddedEmail = async ({ to, recipientName, teamName, addedBy }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('SMTP settings are not configured. Skipping member-added email.');
    return { skipped: true };
  }

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `TaskHive <${fromAddress}>`,
    to,
    subject: `You were added to ${teamName} on TaskHive`,
    text: `Hi ${recipientName || 'there'},\n\nYou have been added to the ${teamName} team on TaskHive${addedBy ? ` by ${addedBy}` : ''}.\n\nOpen TaskHive to view your team tasks and updates.\n\n- TaskHive`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="color:#7c3aed;">You were added to ${teamName}</h2>
        <p>Hi ${recipientName || 'there'},</p>
        <p>You have been added to the <strong>${teamName}</strong> team on TaskHive${addedBy ? ` by <strong>${addedBy}</strong>` : ''}.</p>
        <p>Open TaskHive to view your tasks and team updates.</p>
        <p style="margin-top: 24px; color: #6b7280;">- TaskHive</p>
      </div>
    `,
  });

  return { skipped: false };
};

module.exports = { sendMemberAddedEmail };