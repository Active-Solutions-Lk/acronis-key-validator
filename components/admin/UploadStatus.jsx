import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadStatus({ uploadStatus }) {
  return (
    uploadStatus !== 'idle' && (
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
            Files processed successfully!
          </div>
        )}
        {uploadStatus === 'dbSuccess' && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-3" />
            Data Inserted to database successfully
          </div>
        )}
        {uploadStatus === 'error' && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-3" />
            Error processing files. Please try again.
          </div>
        )}
      </div>
    )
  );
}