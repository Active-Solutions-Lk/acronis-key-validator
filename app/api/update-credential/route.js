'use server';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const { id, email, password, pkg_id, quota, code } = await request.json();

    // console.log('Updating credential with data:', {
    //   id,
    //   email,
    //   password: '***',
    //   pkg_id,
    //   quota,
    //   code
    // });

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: id' 
        },
        { status: 400 }
      );
    }

    // Check if credential exists
    const existingCredential = await prisma.credentials.findUnique({
      where: { id: parseInt(id) },
      include: {
        pkg: true
      }
    });

    if (!existingCredential) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Credential not found' 
        },
        { status: 404 }
      );
    }

    // Check if email already exists (excluding current record)
    if (email && email !== existingCredential.email) {
      const emailExists = await prisma.credentials.findFirst({
        where: { 
          email,
          id: { not: parseInt(id) }
        }
      });

      if (emailExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Email already exists in credentials' 
          },
          { status: 409 }
        );
      }
    }

    // Verify package exists if pkg_id is provided
    if (pkg_id) {
      const packageExists = await prisma.pkg.findUnique({
        where: { id: parseInt(pkg_id) }
      });

      if (!packageExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Package not found' 
          },
          { status: 404 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date()
    };

    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (pkg_id !== undefined) updateData.pkg_id = parseInt(pkg_id);
    if (quota !== undefined) updateData.quota = quota ? parseInt(quota) : null;
    if (code !== undefined) updateData.code = code || null;

    // Update credential
    const updatedCredential = await prisma.credentials.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        pkg: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // console.log('Credential updated successfully:', updatedCredential.id);

    return NextResponse.json({
      success: true,
      message: 'Credential updated successfully',
      credential: updatedCredential
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating credential:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error occurred while updating credential',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}