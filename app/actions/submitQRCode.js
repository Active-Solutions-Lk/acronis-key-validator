import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function submitQRCode(formData) {
  const code = formData.get('code');

  if (!code) {
    return { error: 'No QR code provided' };
  }

  // Check if the QR code exists in the database
  const existingUser = await prisma.user.findUnique({
    where: { qrKey: code },
  });

  if (existingUser) {
    return {
      error: 'QR Code Already Used',
      message: 'Sorry, this QR code has already been registered.',
      contact: 'Please contact the administrator for assistance: Email: admin@acronis.com | Phone: +1-123-456-7890',
    };
  }

  // Redirect to welcome page if QR code is valid
  redirect(`/welcome?code=${encodeURIComponent(code)}`);
}