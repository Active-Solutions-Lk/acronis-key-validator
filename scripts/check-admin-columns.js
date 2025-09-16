import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminColumns() {
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
    
    // console.log('Admin table has department and privilege columns');
    // console.log('Sample admin data:', admins[0]);
  } catch (error) {
    // console.log('Admin table does not have department and privilege columns');
    // console.log('Error:', error.message);
    
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
      
      // console.log('Admin table exists but without department and privilege columns');
      // console.log('Sample admin data:', admins[0]);
    } catch (error2) {
    //  console.log('Error querying admin table:', error2.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminColumns().catch(console.error);