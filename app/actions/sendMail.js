'use server'

import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email/sendMail'




export async function SendMail (code) {
  try {
    const record = await prisma.master.findUnique({
      where: { password: code }
    })

    if (!record || !record.email || !record.accMail || !record.password) {
      throw new Error(
        'Record not found or missing required fields (email, accMail, password).'
      )
    }

    const subject = 'Your Acronis Key Credentials'

    const result = await sendEmail(record.email, subject, record.accMail, record.password)

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
