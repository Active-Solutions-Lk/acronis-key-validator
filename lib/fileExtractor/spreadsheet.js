import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const expectedColumns = [
  'id', 'mspCreate', 'date', 'reseller', 'hoDate', 'package',
  'actDate', 'endDate', 'customer', 'address', 'name', 'email',
  'tel', 'city', 'code', 'accMail', 'password'
];

const validateFile = (file) => {
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
    return { valid: false, error: 'Only CSV and Excel files are supported' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  return { valid: true };
};

const validateDataStructure = (headers, data, expectedColumns = [
  'id', 'mspCreate', 'date', 'reseller', 'hoDate', 'package',
  'actDate', 'endDate', 'customer', 'address', 'name', 'email',
  'tel', 'city', 'code', 'accMail', 'password'
]) => {
  const missingColumns = expectedColumns.filter(col => !headers.includes(col));
  const extraColumns = headers.filter(col => !expectedColumns.includes(col));
  
  // Define required columns based on the expected columns context
  let requiredColumns;
  if (expectedColumns.includes('email') && expectedColumns.includes('password') && !expectedColumns.includes('date')) {
    // This is credentials upload - only email and password are required
    requiredColumns = ['email', 'password'];
  } else {
    // This is master data upload - use original required columns
    requiredColumns = ['date', 'reseller', 'hoDate'];
  }
  
  const missingRequired = requiredColumns.filter(col => !headers.includes(col));
  
  const validation = {
    isValid: missingRequired.length === 0,
    missingColumns,
    extraColumns,
    missingRequired,
    totalRows: data.length,
    validRows: 0,
    errors: []
  };

  if (data.length > 0) {
    const sampleRows = data.slice(0, Math.min(5, data.length));
    sampleRows.forEach((row, index) => {
      requiredColumns.forEach(col => {
        if (!row[col] || row[col].toString().trim() === '') {
          validation.errors.push(`Row ${index + 1}: Missing required field '${col}'`);
        }
      });

      if (row.email && row.email.trim() && !row.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        validation.errors.push(`Row ${index + 1}: Invalid email format`);
      }

      if (row.tel && row.tel.toString().trim() && isNaN(row.tel)) {
        validation.errors.push(`Row ${index + 1}: Phone number must be numeric`);
      }
    });
  }

  validation.validRows = data.length - validation.errors.length;
  return validation;
};

export async function ExtSpreadsheet(file, expectedColumns = [
  'id', 'mspCreate', 'date', 'reseller', 'hoDate', 'package',
  'actDate', 'endDate', 'customer', 'address', 'name', 'email',
  'tel', 'city', 'code', 'accMail', 'password'
]) {
  const fileValidation = validateFile(file);
  if (!fileValidation.valid) {
    return { valid: false, error: fileValidation.error };
  }

  return new Promise((resolve, reject) => {
    if (file.name.toLowerCase().endsWith('.csv')) {
      Papa.parse(file, {
        complete: (results) => {
          const fileHeaders = results.data[0];
          const data = results.data.slice(1).filter(row => row.some(cell => cell.trim() !== ''));
          const jsonData = data.map(row => {
            const obj = {};
            fileHeaders.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });

          const validation = validateDataStructure(fileHeaders, jsonData, expectedColumns);
          resolve({
            valid: validation.isValid,
            headers: fileHeaders,
            data: jsonData,
            validation,
            fileType: 'CSV'
          });
        },
        error: (error) => reject(error),
        header: false,
        skipEmptyLines: true
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const excelData = new Uint8Array(e.target.result);
          const workbook = XLSX.read(excelData, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const fileHeaders = jsonData[0];
          const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));
          const data = rows.map(row => {
            const obj = {};
            fileHeaders.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
          
          const validation = validateDataStructure(fileHeaders, data, expectedColumns);
          resolve({
            valid: validation.isValid,
            headers: fileHeaders,
            data,
            validation,
            fileType: 'Excel'
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  });
}