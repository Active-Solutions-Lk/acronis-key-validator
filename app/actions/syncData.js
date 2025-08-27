'use server';

import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import { AdminSync } from '@/lib/email/adminSync';
import { generateSpreadsheet } from '@/lib/fileGenerate/spreadsheet';

export async function syncData() {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  // console.log('startOfDay:', startOfDay.toISOString(), 'endOfDay:', endOfDay.toISOString());

  try {
    // Fetch admin emails
    const adminMailsResponse = await FetchAdminMails();
    if (!adminMailsResponse.success) {
      console.error('Failed to fetch admin emails:', adminMailsResponse.error);
      return {
        success: false,
        error: 'Failed to fetch admin emails',
        details: adminMailsResponse.details,
      };
    }

    const adminEmails = adminMailsResponse.data
      .map(record => record.email)
      .filter(email => email && email.trim() !== '');

    if (adminEmails.length === 0) {
      console.error('No valid admin emails found');
      return {
        success: false,
        error: 'No valid admin emails available to send the report',
      };
    }

    // console.log('Admin Emails:', adminEmails);

    // Fetch today's records
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-today-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'No records found for today',
      };
    }

    const records = result.data;
    if (!records || records.length === 0) {
      // Send email notification for no records
      const emailResult = await AdminSync(
        adminEmails.join(','),
        `Daily Backup - ${now.toISOString().split('T')[0]}`,
        'No records found for today.',
        null
      );
      return {
        success: emailResult.success,
        message: emailResult.message || 'No records to email',
      };
    }

    // Generate Excel file
    const fileName = `DailyRecords_${now.toISOString().split('T')[0]}.xlsx`;
    const spreadsheetResult = await generateSpreadsheet(records, fileName, 'DailyRecords');

    if (!spreadsheetResult.success) {
      return {
        success: false,
        error: 'Failed to generate spreadsheet',
        details: spreadsheetResult.details,
      };
    }

    const filePath = spreadsheetResult.filePath;

    // Send email with Excel attachment
    const emailResult = await AdminSync(
      adminEmails.join(','),
      `Daily Backup - ${now.toISOString().split('T')[0]}`,
      'Attached is the daily backup of today’s records.',
      {
        filename: fileName,
        path: filePath,
      }
    );

    // Clean up temporary file
    await fs.unlink(filePath);

    if (!emailResult.success) {
      return {
        success: false,
        error: 'Failed to send email',
        details: emailResult.details,
      };
    }

    // console.log('Today’s records:', result);
    return {
      success: true,
      message: 'Records fetched and emailed successfully',
      data: records,
    };
  } catch (error) {
    console.error('Error in syncData:', error);
    return {
      success: false,
      error: 'Error processing data',
      details: error.message,
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function FetchAdminMails() {
  try {
    // Fetch all admin emails (non-null emails from master table)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-sync-mails`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status}`,
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in FetchAdminMails:', error);
    return {
      success: false,
      error: 'Failed to fetch admin emails',
      details: error.message,
    };
  }
}