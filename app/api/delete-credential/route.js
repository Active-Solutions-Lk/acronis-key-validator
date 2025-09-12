'use server';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('Deleting credential with ID:', id);

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: id' 
        },
        { status: 400 }
      );
    }

    // Check if credential exists
    const existingCredential = await prisma.credentials.findUnique({
      where: { id: parseInt(id) },
      include: {
        master: true // Check if credential is referenced by master records
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

    // Check if credential is being used in master records
    if (existingCredential.master && existingCredential.master.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete credential as it is being used in master records' 
        },
        { status: 409 }
      );
    }

    // Delete credential
    await prisma.credentials.delete({
      where: { id: parseInt(id) }
    });

    console.log('Credential deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Credential deleted successfully',
      deletedId: parseInt(id)
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting credential:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error occurred while deleting credential',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const { ids } = await request.json();

    console.log('Bulk deleting credentials with IDs:', ids);

    // Validate required fields
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: ids array' 
        },
        { status: 400 }
      );
    }

    // Convert string IDs to integers
    const credentialIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));

    if (credentialIds.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No valid IDs provided' 
        },
        { status: 400 }
      );
    }

    // Check if any credentials are being used in master records
    const credentialsInUse = await prisma.credentials.findMany({
      where: { 
        id: { in: credentialIds }
      },
      include: {
        master: true
      }
    });

    const credentialsWithMaster = credentialsInUse.filter(cred => cred.master.length > 0);
    
    if (credentialsWithMaster.length > 0) {
      const inUseIds = credentialsWithMaster.map(cred => cred.id);
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete credentials with IDs ${inUseIds.join(', ')} as they are being used in master records` 
        },
        { status: 409 }
      );
    }

    // Delete credentials
    const deleteResult = await prisma.credentials.deleteMany({
      where: { id: { in: credentialIds } }
    });

    console.log('Bulk delete completed. Deleted count:', deleteResult.count);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} credential(s)`,
      deletedCount: deleteResult.count,
      deletedIds: credentialIds
    }, { status: 200 });

  } catch (error) {
    console.error('Error bulk deleting credentials:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error occurred while deleting credentials',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}