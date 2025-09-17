'use server'

import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

// Add a secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function ValidateUser (data) {
  if (!data?.user_name || !data?.password) {
    return { message: 'Username and password are required' }
  }

  try {
    // Find user by username
    const record = await prisma.admin.findUnique({
      where: { user_name: data.user_name }
    })

    // If user not found or password doesn't match
    if (!record || !await bcrypt.compare(data.password, record.password)) {
      return { message: 'Invalid User Name or Password' }
    }
    
    // Create session cookie
    if (record) {
      // Set session expiration (7 days in development, 1 day in production)
      const sessionExpiryHours = process.env.NODE_ENV === 'production' ? 24 : 7 * 24;
      const expiresAt = new Date(Date.now() + sessionExpiryHours * 60 * 60 * 1000);
      
      const session = jwt.sign(
        { userId: record.id, exp: Math.floor(expiresAt.getTime() / 1000) },
        JWT_SECRET
      );
      
      // Fix: await cookies() as required in newer Next.js versions
      const cookieStore = await cookies();
      // Set secure to true for production
      const isSecure = process.env.NODE_ENV === 'production';
      
      cookieStore.set('session', session, {
        httpOnly: true,
        secure: isSecure,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
      });
    }
    
    // Remove password from the response data for security
    const { password: discardedPassword, ...recordWithoutPassword } = record;
    console.log('discardedPassword', discardedPassword)
    
    return {
      message: 'User validated successfully',
      data: recordWithoutPassword,
      status: 200
    }
  } catch (error) {
    console.error('Error in ValidateUser action:', error)
    return { message: error.message || 'Error validating credentials' }
  } finally {
    await prisma.$disconnect()
  }
}

export default ValidateUser