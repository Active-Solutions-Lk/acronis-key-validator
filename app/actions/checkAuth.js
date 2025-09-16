'use server'

import { getCurrentUser } from '@/lib/auth'

export async function checkAuth() {
  try {
    const user = await getCurrentUser()
    // console.log('checkAuth - User data:', user);
    return {
      isAuthenticated: !!user,
      user: user
    }
  } catch (error) {
    console.error('Error checking auth status:', error)
    return {
      isAuthenticated: false,
      user: null
    }
  }
}