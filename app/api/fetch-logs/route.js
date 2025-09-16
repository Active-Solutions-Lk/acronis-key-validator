import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const severity = searchParams.get('severity');
    const action = searchParams.get('action');
    const relatedTable = searchParams.get('relatedTable');
    
    const offset = (page - 1) * limit;

    // Build where clause based on filters
    const where = {};
    
    if (severity) {
      where.severity = parseInt(severity);
    }
    
    if (action) {
      where.action = action;
    }
    
    if (relatedTable) {
      where.related_table = relatedTable;
    }

    // Fetch logs with pagination
    const [logs, total] = await Promise.all([
      prisma.logs.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              user_name: true,
              email: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.logs.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error occurred while fetching logs',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}