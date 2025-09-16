'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Add a secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Get the current user from the session
 * @returns {Promise<Object|null>} The current user object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    // Fix: await cookies() as required in newer Next.js versions
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
   // console.log('Auth check - Session cookie:', sessionCookie);
    
    if (!sessionCookie || !sessionCookie.value) {
     // console.log('Auth check - No session cookie found');
      return null;
    }
    
    // Verify the JWT token
    const decoded = jwt.verify(sessionCookie.value, JWT_SECRET);
    
  //  console.log('Auth check - Decoded JWT:', decoded);
    
    if (!decoded || !decoded.userId) {
   //   console.log('Auth check - Invalid JWT or missing userId');
      return null;
    }
    
    // Fetch the user from the database
    const user = await prisma.admin.findUnique({
      where: { id: decoded.userId }
    });
    
 //   console.log('Auth check - User from DB:', user);
    
    return user;
  } catch (error) {
    // Log specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      console.error('JWT Error:', error.message);
    } else if (error.name === 'TokenExpiredError') {
      console.error('Token Expired:', error.message);
    } else {
      console.error('Auth check error:', error);
    }
    return null;
  }
}

/**
 * Check if the current user is authenticated
 * @returns {Promise<boolean>} Whether the user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
 // console.log('isAuthenticated check:', !!user);
  return !!user;
}