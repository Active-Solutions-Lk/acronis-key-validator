'use server';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    console.log('Creating reseller with data:', {
      company_name,
      address,
      type,
      credit_limit,
      payment_terms,
      note,
      vat,
      city
    });

    // Validate required fields
    if (!company_name || !type || !city) {
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

    console.log('Reseller created successfully:', newReseller.customer_id);

    return NextResponse.json({
      success: true,
      message: 'Reseller created successfully',
      reseller: newReseller
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating reseller:', error);
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