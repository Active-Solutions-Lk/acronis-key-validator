import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function sendEmail(to, subject, accMail, password) {
  // Create transporter with SMTP config from env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Read and populate the HTML template
  const templatePath = path.join(process.cwd(), 'lib', 'email', 'acronis-credentials.html');
  let html = fs.readFileSync(templatePath, 'utf-8');
  html = html.replace('{{accMail}}', accMail).replace('{{password}}', password);

  // Define paths to the PDF files
  const registerStepsPath = path.join(process.cwd(), 'public', 'docs', 'RegisterSteps.pdf');
  const protectionPlanPath = path.join(process.cwd(), 'public', 'docs', 'ProtectionPlan.pdf');

  // Email options with attachments
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    text: `Email: ${accMail}\nPassword: ${password}`,
    html,
    attachments: [
      {
        filename: 'RegisterSteps.pdf',
        path: registerStepsPath,
        contentType: 'application/pdf',
      },
      {
        filename: 'ProtectionPlan.pdf',
        path: protectionPlanPath,
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
 //   console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}