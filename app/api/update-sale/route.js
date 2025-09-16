'use server';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const { 
      id,
      reseller_id,
      credentials_id
    } = await request.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sale ID is required' 
        },
        { status: 400 }
      );
    }

    if (!reseller_id || !credentials_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reseller ID and Credentials ID are required' 
        },
        { status: 400 }
      );
    }

    // Check if sale exists
    const existingSale = await prisma.sales.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSale) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sale not found' 
        },
        { status: 404 }
      );
    }

    // Check if reseller exists
    const resellerExists = await prisma.reseller.findUnique({
      where: { customer_id: parseInt(reseller_id) }
    });

    if (!resellerExists) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reseller not found' 
        },
        { status: 404 }
      );
    }

    // Check if credentials exist
    const credentialsExists = await prisma.credentials.findUnique({
      where: { id: parseInt(credentials_id) }
    });

    if (!credentialsExists) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Credentials not found' 
        },
        { status: 404 }
      );
    }

    // Check if this sale combination already exists (excluding current sale)
    const duplicateSale = await prisma.sales.findFirst({
      where: { 
        reseller_id: parseInt(reseller_id),
        credentials_id: parseInt(credentials_id),
        id: { not: parseInt(id) }
      }
    });

    if (duplicateSale) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This sale combination already exists' 
        },
        { status: 409 }
      );
    }

    // Update sale
    const updatedSale = await prisma.sales.update({
      where: { id: parseInt(id) },
      data: {
        reseller_id: parseInt(reseller_id),
        credentials_id: parseInt(credentials_id),
        updated_at: new Date()
      },
      include: {
        reseller: {
          select: {
            customer_id: true,
            company_name: true
          }
        },
        credentials: {
          include: {
            user: true
          }
        }
      }
    });

    // Transform data to match frontend expectations
    const transformedSale = {
      id: updatedSale.id,
      reseller_id: updatedSale.reseller_id,
      credentials_id: updatedSale.credentials_id,
      created_at: updatedSale.created_at,
      updated_at: updatedSale.updated_at,
      reseller: updatedSale.reseller,
      credentials: {
        id: updatedSale.credentials.id,
        customer: updatedSale.credentials.user?.company || updatedSale.credentials.user?.name || null,
        code: updatedSale.credentials.code || null
      }
    };

    // console.log('Sale updated successfully:', updatedSale.id);

    return NextResponse.json({
      success: true,
      message: 'Sale updated successfully',
      sale: transformedSale
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error occurred while updating sale',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}