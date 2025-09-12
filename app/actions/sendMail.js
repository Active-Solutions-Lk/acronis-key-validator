'use server'

import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email/sendMail'

export async function SendMail (code) {
  try {
    // First find the credential record with the code
    const credential = await prisma.credentials.findFirst({
      where: { code: code },
      include: {
        user: true // Include user information directly (replaces master)
      }
    })

    if (!credential) {
      throw new Error('Record not found for the provided code.')
    }

    // Check if there's a user associated with this credential
    if (!credential.user) {
      throw new Error('No user registered for this code.')
    }

    // Check if we have the required email fields
    if (!credential.user.email || !credential.email || !credential.password) {
      throw new Error(
        'Missing required fields (user email, credential email, or password).'
      )
    }

    const subject = 'Your Acronis Key Credentials'

    // Send email to the registered user with the credential details
    const result = await sendEmail(
      credential.user.email, // Send to the registered user
      subject, 
      credential.email, // Acronis account email from credentials
      credential.password // Acronis account password from credentials
    )

    if (!result.success) {
      throw new Error(result.error)
    }

    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('SendMail error:', error)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}