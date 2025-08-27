import nodemailer from 'nodemailer';

export async function AdminSync(to, subject, body, attachment) {
  try {
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
      port: process.env.SMTP_PORT, // e.g., 587
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // e.g., 'admin@example.com'
        pass: process.env.SMTP_PASS, // e.g., app-specific password
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Acronis Key Sender" <${process.env.SMTP_USER}>`,
      to, // Admin email
      subject, // Email subject
      text: body, // Email body
      attachments: attachment ? [attachment] : [], // Optional attachment
    });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email', details: error.message };
  }
}