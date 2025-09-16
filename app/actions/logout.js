'use server'

import { cookies } from 'next/headers'

export async function logout() {
  try {
    // Get the cookie store
    const cookieStore = await cookies()
    
    // Clear the session cookie by setting it to expire in the past
    cookieStore.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Expire in the past
      sameSite: 'lax',
    //   path: '/',
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error during logout:', error)
    return { success: false, message: 'Logout failed' }
  }
}