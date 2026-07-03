const nodemailer = require("nodemailer");

/**
 * Builds a Nodemailer transporter using the logged-in user's own SMTP
 * credentials, so every user sends job-application emails from their
 * own inbox rather than a shared system account.
 */
function buildTransporter(user) {
  if (!user.hasSmtpConfigured()) {
    throw new Error(
      "Your email sending credentials are not configured yet. Go to Profile -> Email Settings."
    );
  }

  return nodemailer.createTransport({
    host: user.smtp.host,
    port: user.smtp.port,
    secure: user.smtp.secure, // true for 465, false for other ports (STARTTLS)
    auth: {
      user: user.smtp.authUser,
      pass: user.smtp.authPass,
    },
    // Many cloud hosts (Render, Railway, etc.) resolve SMTP hosts to IPv6
    // first, and Gmail's SMTP servers frequently hang/time out over IPv6
    // from those networks. Forcing IPv4 fixes the classic "Connection
    // Timeout" error seen only in production, never locally.
    family: 4,
    connectionTimeout: 20000, // 20s to establish the connection
    greetingTimeout: 20000, // 20s to receive the SMTP greeting
    socketTimeout: 30000, // 30s of inactivity before giving up
  });
}

/**
 * Sends the job-application email with the resume PDF attached.
 * The resume is passed in as a Buffer (read straight from MongoDB),
 * so no local disk file needs to exist for the send to work.
 */
async function sendResumeEmail({ user, toEmail, subject, content, resumeBuffer, resumeOriginalName }) {
  const transporter = buildTransporter(user);

  const info = await transporter.sendMail({
    from: `"${user.name}" <${user.smtp.authUser}>`,
    to: toEmail,
    subject,
    text: content,
    html: content.replace(/\n/g, "<br>"),
    attachments: [
      {
        filename: resumeOriginalName,
        content: resumeBuffer,
      },
    ],
  });

  return info;
}

module.exports = { buildTransporter, sendResumeEmail };