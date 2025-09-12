'use server';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const { 
      id,
      customer_id,
      company_name, 
      address, 
      type, 
      credit_limit, 
      payment_terms, 
      note, 
      vat, 
      city 
    } = await request.json();

    // Use id or customer_id for updating
    const resellerId = id || customer_id;

    console.log('Updating reseller with ID:', resellerId, {
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
    if (!resellerId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reseller ID is required' 
        },
        { status: 400 }
      );
    }

    if (!company_name || !type || !city) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: company_name, type, and city are required' 
        },
        { status: 400 }
      );
    }

    // Check if reseller exists
    const existingReseller = await prisma.reseller.findUnique({
      where: { customer_id: parseInt(resellerId) }
    });

    if (!existingReseller) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reseller not found' 
        },
        { status: 404 }
      );
    }

    // Check if company name already exists (excluding current reseller)
    const duplicateReseller = await prisma.reseller.findFirst({
      where: { 
        company_name: company_name.trim(),
        customer_id: { not: parseInt(resellerId) }
      }
    });

    if (duplicateReseller) {
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

    // Update reseller
    const updatedReseller = await prisma.reseller.update({
      where: { customer_id: parseInt(resellerId) },
      data: {
        company_name: company_name.trim(),
        address: address?.trim() || null,
        type: type.trim(),
        credit_limit: credit_limit?.trim() || null,
        payment_terms: payment_terms?.trim() || null,
        note: note?.trim() || null,
        vat: vat?.trim() || null,
        city: parseInt(city),
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

    console.log('Reseller updated successfully:', updatedReseller.customer_id);

    return NextResponse.json({
      success: true,
      message: 'Reseller updated successfully',
      reseller: updatedReseller
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating reseller:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error occurred while updating reseller',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}