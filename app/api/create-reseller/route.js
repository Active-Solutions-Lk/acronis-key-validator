'use server';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logAction, SEVERITY, ACTION } from '@/lib/logger';

export async function POST(request) {
  try {
    const { 
      company_name, 
      address, 
      type, 
      credit_limit, 
      payment_terms, 
      note, 
      vat, 
      city 
    } = await request.json();

    // console.log('Creating reseller with data:', {
    //   company_name,
    //   address,
    //   type,
    //   credit_limit,
    //   payment_terms,
    //   note,
    //   vat,
    //   city
    // });

    // Validate required fields
    if (!company_name || !type || !city) {
      // Log the validation error
      await logAction({
        relatedTable: 'reseller',
        relatedTableId: 0,
        severity: SEVERITY.ERROR,
        message: 'Failed to create reseller: Missing required fields',
        action: ACTION.CREATE,
        statusCode: 400,
        additionalData: { company_name, type, city }
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: company_name, type, and city are required' 
        },
        { status: 400 }
      );
    }

    // Check if company name already exists
    const existingReseller = await prisma.reseller.findFirst({
      where: { company_name: company_name.trim() }
    });

    if (existingReseller) {
      // Log the duplicate error
      await logAction({
        relatedTable: 'reseller',
        relatedTableId: 0,
        severity: SEVERITY.ERROR,
        message: `Failed to create reseller: Company name "${company_name}" already exists`,
        action: ACTION.CREATE,
        statusCode: 409,
        additionalData: { company_name }
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Company name already exists' 
        },
        { status: 409 }
      );
    }

    // Validate that the city ID exists in the database
    const cityExists = await prisma.sri_lanka_districts_cities.findUnique({
      where: { id: parseInt(city) }
    });

    if (!cityExists) {
      // Log the city validation error
      await logAction({
        relatedTable: 'reseller',
        relatedTableId: 0,
        severity: SEVERITY.ERROR,
        message: `Failed to create reseller: Invalid city ID ${city}`,
        action: ACTION.CREATE,
        statusCode: 400,
        additionalData: { city }
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid city selected' 
        },
        { status: 400 }
      );
    }

    // Create new reseller
    const newReseller = await prisma.reseller.create({
      data: {
        company_name: company_name.trim(),
        address: address?.trim() || null,
        type: type.trim(),
        credit_limit: credit_limit?.trim() || null,
        payment_terms: payment_terms?.trim() || null,
        note: note?.trim() || null,
        vat: vat?.trim() || null,
        city: parseInt(city),
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        sri_lanka_districts_cities: {
          select: {
            id: true,
            district: true,
            city: true
          }
        }
      }
    });

    // console.log('Reseller created successfully:', newReseller.customer_id);

    // Log the successful creation
    await logAction({
      relatedTable: 'reseller',
      relatedTableId: newReseller.customer_id,
      severity: SEVERITY.INFO,
      message: `Reseller "${newReseller.company_name}" created successfully`,
      action: ACTION.CREATE,
      statusCode: 201,
      additionalData: {
        company_name: newReseller.company_name,
        type: newReseller.type,
        city: newReseller.city
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Reseller created successfully',
      reseller: newReseller
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating reseller:', error);
    
    // Log the error
    await logAction({
      relatedTable: 'reseller',
      relatedTableId: 0,
      severity: SEVERITY.ERROR,
      message: `Failed to create reseller: ${error.message}`,
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
        error: 'Server error occurred while creating reseller',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}