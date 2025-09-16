import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logAction, SEVERITY, ACTION } from '@/lib/logger';

export async function DELETE(request) {
  // console.log('DELETE credential route called');
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // console.log('Deleting credential:', id);

    // Validate required fields
    if (!id) {
      // Log the validation error
      await logAction({
        relatedTable: 'credentials',
        relatedTableId: 0,
        severity: SEVERITY.ERROR,
        message: 'Failed to delete credential: Missing ID parameter',
        action: ACTION.DELETE,
        statusCode: 400,
        additionalData: { id }
      });

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
      where: { id: parseInt(id) }
    });

    if (!existingCredential) {
      // Log the not found error
      await logAction({
        relatedTable: 'credentials',
        relatedTableId: parseInt(id),
        severity: SEVERITY.ERROR,
        message: `Failed to delete credential: Credential with ID ${id} not found`,
        action: ACTION.DELETE,
        statusCode: 404,
        additionalData: { id }
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Credential not found' 
        },
        { status: 404 }
      );
    }

    // Delete credential
    await prisma.credentials.delete({
      where: { id: parseInt(id) }
    });

    // console.log('Credential deleted successfully:', id);

    // Log the successful deletion
    await logAction({
      relatedTable: 'credentials',
      relatedTableId: parseInt(id),
      severity: SEVERITY.INFO,
      message: `Credential with ID ${id} deleted successfully`,
      action: ACTION.DELETE,
      statusCode: 200,
      additionalData: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Credential deleted successfully',
      deletedId: parseInt(id)
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting credential:', error);
    
    // Log the error
    await logAction({
      relatedTable: 'credentials',
      relatedTableId: 0,
      severity: SEVERITY.ERROR,
      message: `Failed to delete credential: ${error.message}`,
      action: ACTION.DELETE,
      statusCode: 500,
      additionalData: {
        error: error.message,
        stack: error.stack
      }
    });

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
  // console.log('POST bulk delete credential route called');
  
  try {
    const { ids } = await request.json();

    // console.log('Bulk deleting credentials with IDs:', ids);

    // Validate required fields
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      // Log the validation error
      await logAction({
        relatedTable: 'credentials',
        relatedTableId: 0,
        severity: SEVERITY.ERROR,
        message: 'Failed to bulk delete credentials: Missing or empty IDs array',
        action: ACTION.DELETE,
        statusCode: 400,
        additionalData: { ids }
      });

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
      // Log the validation error
      await logAction({
        relatedTable: 'credentials',
        relatedTableId: 0,
        severity: SEVERITY.ERROR,
        message: 'Failed to bulk delete credentials: No valid IDs provided',
        action: ACTION.DELETE,
        statusCode: 400,
        additionalData: { ids }
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'No valid IDs provided' 
        },
        { status: 400 }
      );
    }

    // Delete credentials
    const deleteResult = await prisma.credentials.deleteMany({
      where: { 
        id: {
          in: credentialIds
        }
      }
    });

    // console.log('Credentials bulk deleted successfully:', deleteResult.count);

    // Log the successful bulk deletion
    await logAction({
      relatedTable: 'credentials',
      relatedTableId: 0,
      severity: SEVERITY.INFO,
      message: `Bulk deleted ${deleteResult.count} credentials`,
      action: ACTION.DELETE,
      statusCode: 200,
      additionalData: { 
        deletedCount: deleteResult.count,
        ids: credentialIds
      }
    });

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} credentials deleted successfully`,
      deletedCount: deleteResult.count,
      deletedIds: credentialIds
    }, { status: 200 });

  } catch (error) {
    console.error('Error bulk deleting credentials:', error);
    
    // Log the error
    await logAction({
      relatedTable: 'credentials',
      relatedTableId: 0,
      severity: SEVERITY.ERROR,
      message: `Failed to bulk delete credentials: ${error.message}`,
      action: ACTION.DELETE,
      statusCode: 500,
      additionalData: {
        error: error.message,
        stack: error.stack
      }
    });

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