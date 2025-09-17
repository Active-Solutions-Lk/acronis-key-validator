'use server';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logAction, SEVERITY, ACTION } from '@/lib/logger';

export async function POST(request) {
  try {
    const { email, password, pkg_id, quota, code, reseller_id, user_id } = await request.json();

    // console.log('Creating credential with data:', {
    //   email,
    //   password: '***',
    //   pkg_id,
    //   pkg_id_type: typeof pkg_id,
    //   pkg_id_cleaned: pkg_id.toString().trim().replace(/\r\n|\r|\n/g, ''),
    //   quota,
    //   code,
    //   reseller_id,
    //   user_id
    // });

    // Validate required fields
    if (!email || !password || !pkg_id) {
      // Log the validation error
      await logAction({
        relatedTable: 'credentials',
        relatedTableId: 0,
        severity: SEVERITY.ERROR,
        message: 'Failed to create credential: Missing required fields',
        action: ACTION.CREATE,
        statusCode: 400,
        additionalData: { email, pkg_id }
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: email, password, and pkg_id are required' 
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingCredential = await prisma.credentials.findFirst({
      where: { email }
    });

    if (existingCredential) {
      // Log the duplicate error
      await logAction({
        relatedTable: 'credentials',
        relatedTableId: 0,
        severity: SEVERITY.ERROR,
        message: `Failed to create credential: Email "${email}" already exists`,
        action: ACTION.CREATE,
        statusCode: 409,
        additionalData: { email }
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Email already exists in credentials' 
        },
        { status: 409 }
      );
    }

    // Verify package exists - handle both ID and name
    let packageRecord;
    const pkgIdAsNumber = parseInt(pkg_id);
    
    // console.log('Package lookup:', {
    //   pkg_id,
    //   pkgIdAsNumber,
    //   isNumber: !isNaN(pkgIdAsNumber)
    // });

    if (!isNaN(pkgIdAsNumber)) {
      // pkg_id is a number, look up by ID
      packageRecord = await prisma.pkg.findUnique({
        where: { id: pkgIdAsNumber }
      });
      // console.log('Package found by ID:', packageRecord?.name);
    } else {
      // pkg_id is a string, look up by name (case-insensitive)
      const cleanPackageName = pkg_id.toString().trim().replace(/\r\n|\r|\n/g, '');
      // console.log('Looking for package by name:', cleanPackageName);
      
      // First try exact match
      packageRecord = await prisma.pkg.findFirst({
        where: { 
          name: {
            equals: cleanPackageName,
            mode: 'insensitive'
          }
        }
      });
      
      if (!packageRecord) {
        // Get all packages for case-insensitive search
        const allPackages = await prisma.pkg.findMany({
          select: { id: true, name: true }
        });
        
        // console.log('All packages:', allPackages);
        
        packageRecord = allPackages.find(pkg => 
          pkg.name?.toLowerCase() === cleanPackageName.toLowerCase()
        );
        
        if (!packageRecord) {
          // Try case-insensitive partial match
          packageRecord = allPackages.find(pkg => 
            pkg.name?.toLowerCase().includes(cleanPackageName.toLowerCase()) ||
            cleanPackageName.toLowerCase().includes(pkg.name?.toLowerCase())
          );
        }
        
        // console.log('Package found by case-insensitive search:', packageRecord?.name);
      }
    }

    if (!packageRecord) {
      // List available packages for debugging
      const availablePackages = await prisma.pkg.findMany({
        select: { id: true, name: true }
      });
      
      // console.log('Available packages:', availablePackages);
      
      // Log the package not found error
      await logAction({
        relatedTable: 'credentials',
        relatedTableId: 0,
        severity: SEVERITY.ERROR,
        message: `Failed to create credential: Package "${pkg_id}" not found`,
        action: ACTION.CREATE,
        statusCode: 404,
        additionalData: { 
          pkg_id, 
          availablePackages: availablePackages.map(p => p.name) 
        }
      });

      return NextResponse.json(
        { 
          success: false, 
          error: `Package not found: "${pkg_id}". Available packages: ${availablePackages.map(p => p.name).join(', ')}` 
        },
        { status: 404 }
      );
    }

    // Create new credential
    const newCredential = await prisma.credentials.create({
      data: {
        email,
        password,
        pkg_id: packageRecord.id, // Use the found package ID
        quota: quota ? parseInt(quota) : null,
        code: code || null,
        user_id: user_id ? parseInt(user_id) : null,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        pkg: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    });

    // console.log('Credential created successfully:', newCredential.id);

    // Create sale record if reseller_id is provided
    if (reseller_id) {
      try {
        await prisma.sales.create({
          data: {
            reseller_id: parseInt(reseller_id),
            credentials_id: newCredential.id
          }
        });
        // console.log('Sale record created for reseller:', reseller_id);
      } catch (saleError) {
        console.error('Error creating sale record:', saleError);
        // Don't fail the credential creation if sale creation fails
      }
    }

    // Log the successful creation
    await logAction({
      relatedTable: 'credentials',
      relatedTableId: newCredential.id,
      severity: SEVERITY.INFO,
      message: `Credential with email "${newCredential.email}" created successfully`,
      action: ACTION.CREATE,
      statusCode: 201,
      additionalData: {
        email: newCredential.email,
        pkg_id: newCredential.pkg_id,
        code: newCredential.code
      }
    });

    // Return the created credential with related data
    const credentialWithRelations = await prisma.credentials.findUnique({
      where: { id: newCredential.id },
      include: {
        pkg: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Credential created successfully',
      credential: credentialWithRelations
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating credential:', error);
    
    // Log the error
    await logAction({
      relatedTable: 'credentials',
      relatedTableId: 0,
      severity: SEVERITY.ERROR,
      message: `Failed to create credential: ${error.message}`,
      action: ACTION.CREATE,
      statusCode: 500,
      additionalData: {
        error: error.message,
        stack: error.stack
      }
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error occurred while creating credential',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}