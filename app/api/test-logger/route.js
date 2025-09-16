import { NextResponse } from 'next/server';
import { logInfo, logError } from '@/lib/logger';

export async function GET() {
  try {
    // Test info log (should automatically get admin ID from session)
    await logInfo({
      relatedTable: 'test',
      relatedTableId: 1,
      message: 'Test info log entry from API route',
      action: 'READ',
      statusCode: 200
    });

    // Test error log (should automatically get admin ID from session)
    await logError({
      relatedTable: 'test',
      relatedTableId: 2,
      message: 'Test error log entry from API route',
      action: 'READ',
      statusCode: 500
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Logger test completed successfully' 
    });
  } catch (error) {
    console.error('Logger test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}