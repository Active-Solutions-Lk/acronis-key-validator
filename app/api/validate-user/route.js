// app/api/validate-user/route.js
'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Add a secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request) {
  try {
    const { user_name, password } = await request.json()

    if (!user_name || !password) {
      return new Response(
        JSON.stringify({ message: 'Required data one or two is empty' }),
        { status: 400 }
      )
    }
    const record = await prisma.admin.findUnique({
      where: { user_name, password }
    })

    if (!record) {
      return new Response(
        JSON.stringify({ message: 'Invalid User Name or Password' }),
        { status: 404 }
      )
    }
    
    if (record) {
      try {
        console.log('userId', record.id)
        await createSession(record.id)
      } catch (error) {
        console.log('Error creating session:', error)
        return new Response(
          JSON.stringify({ message: 'Error creating session' }),
          { status: 500 }
        )
      }
    }
    
    return new Response(
      JSON.stringify({
        message: 'User validated successfully',
        data: record,
        status: 200
      }),
      { status: 200 }
    )
  } catch (error) {
    console.log('Error validating user:', error)
    return new Response(
      JSON.stringify({ message: 'Server error' }),
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

async function createSession(userId) {
  // console.log('createSession is called for ', userId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = jwt.sign(
    { userId, exp: Math.floor(expiresAt.getTime() / 1000) },
    JWT_SECRET
  );
  // console.log('Generated session token:', session); // Add this for debugging
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
  // console.log('Cookie set successfully'); // Add this for debugging
}