import { NextResponse } from 'next/server';
import cron from 'node-cron';
import { syncData } from '@/app/actions/syncData';

// Store the cron job instance to prevent multiple schedules
let cronJob = null;

export async function POST() {
  try {
    // Prevent multiple cron jobs from being scheduled
    if (!cronJob) {
      cronJob = cron.schedule(
        '59 23 * * *', // Run at 11:59 PM daily
        async () => {
          // console.log('Running daily syncData job at 11:59 PM Asia/Colombo...');
          const result = await syncData();
          // console.log('Daily syncData result:', result);
        },
        {
          timezone: 'Asia/Colombo' // Set to UTC+05:30 (Colombo, Sri Lanka)
        }
      );
      // console.log('Cron job scheduled to run daily at 11:59 PM Asia/Colombo');
    }
    return NextResponse.json(
      { message: 'Cron job scheduled or already running' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error scheduling cron job:', error);
    return NextResponse.json(
      { message: 'Failed to schedule cron job', error: error.message },
      { status: 500 }
    );
  }
}