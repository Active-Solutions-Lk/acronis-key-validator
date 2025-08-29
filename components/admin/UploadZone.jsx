import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

export default function UploadZone({ isDragActive, setIsDragActive, onFilesSelected }) {
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, [setIsDragActive]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, [setIsDragActive]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      onFilesSelected(fileList);
    }
  }, [setIsDragActive, onFilesSelected]);

  const handleFileInput = (e) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      onFilesSelected(fileList);
    }
  };

  return (
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
        <Upload className={`w-16 h-16 mb-4 transition-colors ${isDragActive ? 'text-black' : 'text-gray-400'}`} />
        <h3 className="text-2xl font-semibold text-black mb-2">
          {isDragActive ? 'Drop your files here' : 'Drag & drop or click to upload'}
        </h3>
        <p className="text-gray-500 mb-4">Supports CSV, XLSX files up to 10MB each</p>
        <div className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Choose Files
        </div>
      </div>
    </div>
  );
}