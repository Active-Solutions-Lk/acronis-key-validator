import React from 'react';
import { FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function FileList({ files, removeFile, formatFileSize }) {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-black">Uploaded Files ({files.length})</h4>
        <button
          onClick={() => removeFile(null)}
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
              <FileText className={`w-8 h-8 mr-3 ${file.valid ? 'text-gray-600' : 'text-red-500'}`} />
              <div className="flex-1">
                <p className="font-medium text-black">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)}
                  {file.error && <span className="text-red-500 ml-2">• {file.error}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {file.uploaded && file.valid && <CheckCircle className="w-5 h-5 text-green-500 mr-3" />}
              {file.error && <AlertCircle className="w-5 h-5 text-red-500 mr-3" />}
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
  );
}