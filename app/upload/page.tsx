// app/upload/page.tsx
'use client';

import { useState, FormEvent } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setMessage(result.message || `Successfully uploaded ${result.count} connections!`);
    } catch (error: any) {
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Upload Your Connections</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-400">
              LinkedIn Connections CSV
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-300
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-indigo-600 file:text-white
                         hover:file:bg-indigo-700"
            />
          </div>
          <button
            type="submit"
            disabled={!file || isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md
                       hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                       disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Upload & Process'}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-300">{message}</p>
        )}
      </div>
    </div>
  );
}
