'use server';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { id, ids } = await request.json();

    console.log('Delete request:', { id, ids });

    // Handle single delete
    if (id) {
      // Check if reseller exists
      const existingReseller = await prisma.reseller.findUnique({
        where: { customer_id: parseInt(id) },
        include: {
          sales: true  // Check for related sales records
        }
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

      // Check if reseller has associated sales records
      if (existingReseller.sales && existingReseller.sales.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Cannot delete reseller with associated sales records. Delete sales records first.' 
          },
          { status: 409 }
        );
      }

      // Delete reseller
      await prisma.reseller.delete({
        where: { customer_id: parseInt(id) }
      });

      console.log('Reseller deleted successfully:', id);

      return NextResponse.json({
        success: true,
        message: 'Reseller deleted successfully'
      }, { status: 200 });
    }

    // Handle bulk delete
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const resellerIds = ids.map(id => parseInt(id));
      
      // Check which resellers exist and have sales records
      const existingResellers = await prisma.reseller.findMany({
        where: { customer_id: { in: resellerIds } },
        include: {
          sales: true
        }
      });

      // Find resellers with sales records
      const resellersWithSales = existingResellers.filter(reseller => 
        reseller.sales && reseller.sales.length > 0
      );

      if (resellersWithSales.length > 0) {
        const companiesWithSales = resellersWithSales.map(r => r.company_name);
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot delete resellers with associated sales records: ${companiesWithSales.join(', ')}. Delete sales records first.` 
          },
          { status: 409 }
        );
      }

      // Delete resellers that have no sales records
      const deleteResult = await prisma.reseller.deleteMany({
        where: { customer_id: { in: resellerIds } }
      });

      console.log('Resellers bulk deleted successfully:', deleteResult.count);

      return NextResponse.json({
        success: true,
        message: `${deleteResult.count} reseller(s) deleted successfully`,
        deletedCount: deleteResult.count,
        deletedIds: resellerIds
      }, { status: 200 });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'No valid ID or IDs provided' 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error deleting reseller:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error occurred while deleting reseller',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}