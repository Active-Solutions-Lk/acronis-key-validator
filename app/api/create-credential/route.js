'use server';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password, pkg_id, quota, code, reseller_id, user_id } = await request.json();

    console.log('Creating credential with data:', {
      email,
      password: '***',
      pkg_id,
      pkg_id_type: typeof pkg_id,
      pkg_id_cleaned: pkg_id.toString().trim().replace(/\r\n|\r|\n/g, ''),
      quota,
      code,
      reseller_id,
      user_id
    });

    // Validate required fields
    if (!email || !password || !pkg_id) {
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
    
    console.log('Package lookup:', {
      original_pkg_id: pkg_id,
      parsed_number: pkgIdAsNumber,
      is_number: !isNaN(pkgIdAsNumber)
    });
    
    if (!isNaN(pkgIdAsNumber)) {
      // If pkg_id is a valid number, look up by ID
      packageRecord = await prisma.pkg.findUnique({
        where: { id: pkgIdAsNumber }
      });
      console.log('Package found by ID:', packageRecord?.name);
    } else {
      // If pkg_id is not a number, treat it as package name and look up by name
      const cleanPackageName = pkg_id.toString().trim().replace(/\r\n|\r|\n/g, '');
      console.log('Looking up package by name:', cleanPackageName);
      
      // Try exact match first
      packageRecord = await prisma.pkg.findFirst({
        where: { 
          name: cleanPackageName
        }
      });
      console.log('Package found by exact name:', packageRecord?.name);
      
      // If exact match fails, get all packages and do case-insensitive search
      if (!packageRecord) {
        const allPackages = await prisma.pkg.findMany({
          select: { id: true, name: true }
        });
        
        // Try case-insensitive exact match
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
        
        console.log('Package found by case-insensitive search:', packageRecord?.name);
      }
    }

    if (!packageRecord) {
      // List available packages for debugging
      const availablePackages = await prisma.pkg.findMany({
        select: { id: true, name: true }
      });
      
      console.log('Available packages:', availablePackages);
      
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

    console.log('Credential created successfully:', newCredential.id);

    // Create sale record if reseller_id is provided
    if (reseller_id) {
      try {
        await prisma.sales.create({
          data: {
            reseller_id: parseInt(reseller_id),
            credentials_id: newCredential.id
          }
        });
        console.log('Sale record created for reseller:', reseller_id);
      } catch (saleError) {
        console.error('Error creating sale record:', saleError);
        // Don't fail the credential creation if sale creation fails
      }
    }

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
        },
        sales: {
          include: {
            reseller: {
              select: {
                customer_id: true,
                company_name: true
              }
            }
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