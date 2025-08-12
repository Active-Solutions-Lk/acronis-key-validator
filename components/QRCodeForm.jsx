'use client';

import { useState } from 'react';
import { submitQRCode } from '@/app/actions/submitQRCode';

export default function QRCodeForm() {
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setError(null);
    const result = await submitQRCode(formData);
    if (result?.error) {
      setError(result);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Enter QR Code</h1>
        {error && (
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-red-600">{error.error}</h2>
            <p className="text-gray-600 mb-2">{error.message}</p>
            <p className="text-gray-600">{error.contact}</p>
          </div>
        )}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="code"
              placeholder="Enter your QR code"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-700 placeholder-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}