'use server';

import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import { AdminSync } from '@/lib/email/adminSync';
import { generateSpreadsheet } from '@/lib/fileGenerate/spreadsheet';

export async function syncData(fromDate = null, toDate = null) {
  // If no dates provided, use today's date
  const now = new Date();
  const startOfDay = fromDate 
    ? new Date(fromDate)
    : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay = toDate 
    ? new Date(toDate)
    : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

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

    // Fetch sales within the date range
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
        error: result.message || 'No sales found for the selected period',
      };
    }

    const sales = result.data;
    if (!sales || sales.length === 0) {
      // Send email notification for no sales
      const emailResult = await AdminSync(
        adminEmails.join(','),
        `Sales Report - ${startOfDay.toISOString().split('T')[0]} to ${endOfDay.toISOString().split('T')[0]}`,
        'No sales found for the selected period.',
        null
      );
      return {
        success: emailResult.success,
        message: emailResult.message || 'No sales to email',
      };
    }

    // Generate Excel file
    const fileName = `SalesReport_${startOfDay.toISOString().split('T')[0]}_to_${endOfDay.toISOString().split('T')[0]}.xlsx`;
    const spreadsheetResult = await generateSpreadsheet(sales, fileName, 'SalesReport');

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
      `Sales Report - ${startOfDay.toISOString().split('T')[0]} to ${endOfDay.toISOString().split('T')[0]}`,
      `Attached is the sales report for the period ${startOfDay.toISOString().split('T')[0]} to ${endOfDay.toISOString().split('T')[0]}.`,
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

    return {
      success: true,
      message: 'Sales fetched and emailed successfully',
      data: sales,
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
    // Fetch all admin emails (non-null emails from admin table)
    const admins = await prisma.admin.findMany({
      where: {
        email: {
          not: null,
          not: ''
        }
      },
      select: {
        email: true
      }
    });

    return {
      success: true,
      data: admins
    };
  } catch (error) {
    console.error('Error in FetchAdminMails:', error);
    return {
      success: false,
      error: 'Failed to fetch admin emails',
      details: error.message,
    };
  }
}