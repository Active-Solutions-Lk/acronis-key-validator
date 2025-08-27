/**
 * Simple test for the spreadsheet extractor utilities
 * This file demonstrates how to use the new utilities and verifies basic functionality
 */

import { 
  defaultSpreadsheetExtractor, 
  utils 
} from '../lib/fileExtractor/spreadsheetExtractor.js';
import { FileValidator } from '../lib/fileValidator.js';
import { DataValidator, DEFAULT_MASTER_SCHEMA } from '../lib/dataValidator.js';

// Test the file validator
console.log('Testing File Validator...');
const fileValidator = new FileValidator();

// Test utility functions
console.log('File size formatting test:', utils.formatFileSize(1024 * 1024 * 2.5)); // Should show 2.5 MB
console.log('File type detection test:', utils.getFileType('data.csv')); // Should show 'csv'
console.log('File type detection test:', utils.getFileType('data.xlsx')); // Should show 'excel'

// Test data validator
console.log('\\nTesting Data Validator...');
const dataValidator = new DataValidator(DEFAULT_MASTER_SCHEMA);

// Test sample data
const testHeaders = ['id', 'date', 'reseller', 'hoDate', 'email', 'tel'];
const testData = [
  { id: '1', date: '2024-01-01', reseller: 'ABC Corp', hoDate: '2024-01-02', email: 'test@example.com', tel: '1234567890' },
  { id: '2', date: '2024-01-02', reseller: 'XYZ Ltd', hoDate: '2024-01-03', email: 'invalid-email', tel: 'abc123' },
  { id: '3', date: '', reseller: '', hoDate: '2024-01-04', email: 'good@example.com', tel: '9876543210' }
];

const validationResult = dataValidator.validateDataStructure(testHeaders, testData);
console.log('Validation result:', validationResult);
console.log('Validation summary:', dataValidator.getValidationSummary(validationResult));

// Test configurations
console.log('\\nTesting Configuration Updates...');
const customValidator = new DataValidator({
  expectedColumns: ['id', 'name', 'email'],
  requiredColumns: ['id', 'name'],
  dataTypes: {
    email: 'email',
    id: 'number'
  }
});

const customTestData = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: 'abc', name: '', email: 'invalid-email' }
];

const customValidation = customValidator.validateDataStructure(['id', 'name', 'email'], customTestData);
console.log('Custom validation result:', customValidation);

console.log('\\nUtility tests completed successfully!');

// Export for potential use in other test files
export {
  fileValidator,
  dataValidator,
  testHeaders,
  testData,
  validationResult
};