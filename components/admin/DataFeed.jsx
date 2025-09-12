import React, { useState } from 'react';
import UploadZone from './UploadZone';
import FileList from './FileList';
import UploadStatus from './UploadStatus';
import { ExtSpreadsheet } from '../../lib/fileExtractor/spreadsheet';

export default function DataFeed({ onDataProcessed, expectedColumns }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle');


  const processFiles = async (fileList) => {
    const newFiles = [];
    let processedData = [];

    for (let file of Array.from(fileList)) {
      const fileData = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        valid: true,
        error: null,
        uploaded: false,
        parsed: false,
        dataValidation: null
      };

      try {
        setUploadStatus('uploading');
        const parseResult = await ExtSpreadsheet(file, expectedColumns);
        fileData.parseResult = parseResult;
        fileData.dataValidation = parseResult.validation;
        fileData.parsed = true;
        fileData.valid = parseResult.valid;
        if (!parseResult.valid) {
          fileData.error = parseResult.error || `Data structure issues: ${parseResult.validation?.errors.slice(0, 3).join(', ')}`;
        } else {
          // Set id to null for each row in the parsed data
          const dataWithNullId = parseResult.data.map(row => ({
            ...row,
            id: null
          }));
          processedData = [...processedData, ...dataWithNullId];
        }
      } catch (error) {
        fileData.valid = false;
        fileData.error = 'Failed to process file: ' + error.message;
      }

      newFiles.push(fileData);
    }

    setFiles(prev => [...prev, ...newFiles]);
    const validFiles = newFiles.filter(f => f.valid);
    if (validFiles.length > 0) {
      setUploadStatus('success');
      setFiles(prev => prev.map(f => ({ ...f, uploaded: f.valid })));
      // Pass the processed data to the parent component and wait for DB response
      if (processedData.length > 0) {
        const dbResult = await onDataProcessed(processedData);
        if (dbResult.success) {
          setUploadStatus('dbSuccess');
        } else {
          setUploadStatus('error');
        }
      }
    } else {
      setUploadStatus('error');
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

  return (
    <div className="min-h-1/2 bg-white flex flex-col items-center justify-center p-1">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-2">
          <p className="text-gray-600">Upload your CSV or Excel files to process data</p>
        </div>
        <UploadZone isDragActive={isDragActive} setIsDragActive={setIsDragActive} onFilesSelected={processFiles} />
        <UploadStatus uploadStatus={uploadStatus} />
        {files.length > 0 && <FileList files={files} removeFile={removeFile} formatFileSize={formatFileSize} />}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Secure file upload • Files are processed locally • No data is stored
          </p>
        </div>
      </div>
    </div>
  );
}