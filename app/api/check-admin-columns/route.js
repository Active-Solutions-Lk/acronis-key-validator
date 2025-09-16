import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Try to query the admin table with department and privilege fields
    const admins = await prisma.admin.findMany({
      take: 1,
      select: {
        id: true,
        user_name: true,
        email: true,
        department: true,
        privilege: true,
        sync: true
      }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin table has department and privilege columns',
        hasColumns: true,
        sample: admins[0]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // console.log('Error querying with department/privilege:', error.message);
    
    // Try to query without department and privilege
    try {
      const admins = await prisma.admin.findMany({
        take: 1,
        select: {
          id: true,
          user_name: true,
          email: true,
          sync: true
        }
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Admin table exists but without department and privilege columns',
          hasColumns: false,
          sample: admins[0]
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error querying admin table',
          message: error2.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}