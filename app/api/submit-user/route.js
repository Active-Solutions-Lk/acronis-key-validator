import prisma from '@/lib/prisma';
   import { NextResponse } from 'next/server';

   export async function POST(request) {
     try {
       const { name, email, company, tel, qrKey } = await request.json();

       // Validate required fields
       if (!name || !email || !tel || !qrKey) {
         return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
       }

       // Create user in the database
       const user = await prisma.user.create({
         data: {
           name,
           email,
           company: company || null, // Handle optional field
           tel,
           qrKey,
           created_at: new Date(),
           updated_at: new Date(),
         },
       });

       return NextResponse.json({ user }, { status: 201 });
     } catch (error) {
       console.error('Error creating user:', error);
       if (error.code === 'P2002') {
         return NextResponse.json({ error: 'QR code or email already exists' }, { status: 409 });
       }
       return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
     }
   }