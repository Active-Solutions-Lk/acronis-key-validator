import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Database, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

function DataFeed() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Master schema column mapping
  const expectedColumns = [
    'id', 'mspCreate', 'date', 'reseller', 'hoDate', 'package', 
    'actDate', 'endDate', 'customer', 'address', 'name', 'email', 
    'tel', 'city', 'code', 'accMail', 'password'
  ];

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

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

  const validateDataStructure = (headers, data) => {
    const missingColumns = expectedColumns.filter(col => !headers.includes(col));
    const extraColumns = headers.filter(col => !expectedColumns.includes(col));
    
    // Check for required columns (non-nullable in schema)
    const requiredColumns = ['date', 'reseller', 'hoDate'];
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

    // Validate data types for first few rows
    if (data.length > 0) {
      const sampleRows = data.slice(0, Math.min(5, data.length));
      sampleRows.forEach((row, index) => {
        // Check required fields
        requiredColumns.forEach(col => {
          if (!row[col] || row[col].toString().trim() === '') {
            validation.errors.push(`Row ${index + 1}: Missing required field '${col}'`);
          }
        });

        // Check email format if present
        if (row.email && row.email.trim() && !row.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          validation.errors.push(`Row ${index + 1}: Invalid email format`);
        }

        // Check tel is numeric if present
        if (row.tel && row.tel.toString().trim() && isNaN(row.tel)) {
          validation.errors.push(`Row ${index + 1}: Phone number must be numeric`);
        }
      });
    }

    validation.validRows = data.length - validation.errors.length;
    
    return validation;
  };

  const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
      if (file.name.toLowerCase().endsWith('.csv')) {
        // Parse CSV
        Papa.parse(file, {
          complete: (results) => {
            const headers = results.data[0];
            const data = results.data.slice(1).filter(row => row.some(cell => cell.trim() !== ''));
            const validation = validateDataStructure(headers, data.map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            }));
            resolve({ headers, data, validation, fileType: 'CSV' });
          },
          error: (error) => reject(error),
          header: false,
          skipEmptyLines: true
        });
      } else {
        // Parse Excel
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            const headers = jsonData[0];
            const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));
            const validation = validateDataStructure(headers, rows.map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            }));
            
            resolve({ headers, data: rows, validation, fileType: 'Excel' });
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const processFiles = async (fileList) => {
    const newFiles = [];
    
    for (let file of Array.from(fileList)) {
      const validation = validateFile(file);
      const fileData = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        valid: validation.valid,
        error: validation.error,
        uploaded: false,
        parsed: false,
        dataValidation: null
      };

      // console.log('File validation:', validation);
      console.log('File data:', fileData);

      if (validation.valid) {
        try {
          setUploadStatus('uploading');
          const parseResult = await parseFile(file);
          fileData.parseResult = parseResult;
          fileData.dataValidation = parseResult.validation;
          fileData.parsed = true;
          fileData.valid = parseResult.validation.isValid;
          if (!parseResult.validation.isValid) {
            fileData.error = `Data structure issues: ${parseResult.validation.errors.slice(0, 3).join(', ')}`;
          }
        } catch (error) {
          fileData.valid = false;
          fileData.error = 'Failed to parse file: ' + error.message;
        }
      }

      newFiles.push(fileData);
    }

    setFiles(prev => [...prev, ...newFiles]);
    
    // Update status based on results
    const validFiles = newFiles.filter(f => f.valid);
    if (validFiles.length > 0) {
      setUploadStatus('success');
      setFiles(prev => prev.map(f => ({ ...f, uploaded: f.valid })));
    } else {
      setUploadStatus('error');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      processFiles(fileList);
    }
  }, []);

  const handleFileInput = (e) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      processFiles(fileList);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (files.length === 1) {
      setUploadStatus('idle');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearAll = () => {
    setFiles([]);
    setUploadStatus('idle');
    setPreviewData(null);
    setShowPreview(false);
  };

  const showDataPreview = (fileData) => {
    if (fileData.parseResult) {
      setPreviewData(fileData);
      setShowPreview(true);
    }
  };

  const insertToDatabase = async (fileData) => {
    // This would be your actual API call to insert data
    console.log('Inserting to database:', {
      fileName: fileData.name,
      rows: fileData.parseResult.data.length,
      validation: fileData.dataValidation
    });
    
    
    // Simulate API call
    alert(`Ready to insert ${fileData.parseResult.data.length} rows from ${fileData.name} to master schema!`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Data Feed Upload</h1>
          <p className="text-gray-600">Upload your CSV or Excel files to process data</p>
        </div>

        {/* Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            isDragActive
              ? 'border-black bg-gray-50 scale-105'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center">
            <Upload className={`w-16 h-16 mb-4 transition-colors ${
              isDragActive ? 'text-black' : 'text-gray-400'
            }`} />
            
            <h3 className="text-2xl font-semibold text-black mb-2">
              {isDragActive ? 'Drop your files here' : 'Drag & drop or click to upload'}
            </h3>
            
            <p className="text-gray-500 mb-4">
              Supports CSV, XLSX files up to 10MB each
            </p>
            
            <div className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Choose Files
            </div>
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus !== 'idle' && (
          <div className="mt-6 p-4 rounded-lg border">
            {uploadStatus === 'uploading' && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                Uploading files...
              </div>
            )}
            {uploadStatus === 'success' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-3" />
                Files uploaded successfully!
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-3" />
                Error uploading files. Please try again.
              </div>
            )}
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-black">
                Uploaded Files ({files.length})
              </h4>
              <button
                onClick={clearAll}
                className="text-gray-500 hover:text-black text-sm font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    file.valid ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <FileText className={`w-8 h-8 mr-3 ${
                      file.valid ? 'text-gray-600' : 'text-red-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-black">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                        {file.error && (
                          <span className="text-red-500 ml-2">• {file.error}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {file.uploaded && file.valid && (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    )}
                    {file.error && (
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Secure file upload • Files are processed locally • No data is stored
          </p>
        </div>
      </div>
    </div>
  );
}

export default DataFeed;