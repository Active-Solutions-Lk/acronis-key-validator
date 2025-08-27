import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

export async function generateSpreadsheet(data, fileName, sheetName = 'Sheet1') {
  try {
    // Ensure public/dailySyncTemp directory exists
    const tempDir = path.join(process.cwd(), 'public', 'dailySyncTemp');
    await fs.mkdir(tempDir, { recursive: true });

    // Generate Excel file
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Define file path
    const filePath = path.join(tempDir, fileName);

    // Write Excel file
    await fs.writeFile(filePath, XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }));

    return { success: true, filePath };
  } catch (error) {
    console.error('Error generating spreadsheet:', error);
    return { success: false, error: 'Failed to generate spreadsheet', details: error.message };
  }
}