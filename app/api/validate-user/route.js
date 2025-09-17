// app/api/validate-user/route.js
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { user_name, password } = await request.json();

    console.log('user_name', user_name, 'password', password)

    if (!user_name || !password) {
      return new Response(
        JSON.stringify({ message: 'Required data one or two is empty' }),
        { status: 400 }
      )
    }
    
    // Find user by username
    const record = await prisma.admin.findUnique({
      where: { user_name }
    })

    // If user not found or password doesn't match
    if (!record || !await bcrypt.compare(password, record.password)) {
      return new Response(
        JSON.stringify({ message: 'Invalid User Name or Passwordsss' }),
        { status: 404 }
      )
    }
    
    // Remove password from the response data for security
    const { password: unusedPassword, ...recordWithoutPassword } = record;
    console.log('unusedPassword', unusedPassword)
    return new Response(
      JSON.stringify({
        message: 'User validated successfully',
        data: recordWithoutPassword,
        status: 200
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
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