'use client';

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, Info, Globe, Linkedin } from 'lucide-react';
import Navigation from '@/components/Navigation';

type UploadState = 'idle' | 'uploading' | 'geocoding' | 'success' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [message, setMessage] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);
  const [geocodeProgress, setGeocodeProgress] = useState({ processed: 0, total: 0 });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
    } else {
      setMessage('Please upload a CSV file');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const runGeocoding = async () => {
    setUploadState('geocoding');
    let totalProcessed = 0;
    let hasMore = true;
    
    while (hasMore) {
      try {
        const res = await fetch('/api/geocode');
        const data = await res.json();
        
        if (data.processed === 0 || data.message?.includes('No pending')) {
          hasMore = false;
        } else {
          totalProcessed += data.updated || 0;
          setGeocodeProgress({ processed: totalProcessed, total: uploadedCount });
        }
      } catch {
        hasMore = false;
      }
    }
    
    setGeocodeProgress({ processed: totalProcessed, total: uploadedCount });
    setUploadState('success');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    setUploadState('uploading');
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

      setUploadedCount(result.count || 0);
      setMessage(`Uploaded ${result.count} connections!`);
      
      // Start geocoding
      await runGeocoding();

    } catch (error: unknown) {
      setUploadState('error');
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setMessage(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <main className="pt-14">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Instructions */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-bold text-white mb-4">
                  Upload Your Connections
                </h1>
                <p className="text-[#b0b0b0] mb-8">
                  Export your LinkedIn connections and upload the CSV file to visualize your network.
                </p>
              </motion.div>

              {/* Instructions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-linkedin p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0a66c2]/10 flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-[#0a66c2]" />
                  </div>
                  <h3 className="font-semibold text-white">How to export from LinkedIn</h3>
                </div>
                
                <ol className="space-y-4">
                  {[
                    'Go to LinkedIn.com and click your profile picture',
                    'Select "Settings & Privacy"',
                    'Go to "Data Privacy" → "Get a copy of your data"',
                    'Choose "Connections" and request archive',
                    'Download and extract the ZIP file',
                    'Upload the Connections.csv file here'
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0a66c2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-[#0a66c2]">{i + 1}</span>
                      </div>
                      <span className="text-[#b0b0b0] text-sm">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 p-3 rounded-lg bg-[#0a66c2]/10 flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#70b5f9] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#70b5f9]">
                    LinkedIn may take a few minutes to prepare your data export.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <form onSubmit={handleSubmit}>
                {/* Dropzone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    relative card-linkedin p-12 text-center transition-all cursor-pointer
                    ${dragActive 
                      ? 'ring-2 ring-[#0a66c2] bg-[#0a66c2]/5' 
                      : 'hover:bg-[#38434f]/20'}
                    ${file ? 'ring-2 ring-[#057642]' : ''}
                  `}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadState !== 'idle'}
                  />
                  
                  <AnimatePresence mode="wait">
                    {!file ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-[#1d2226] flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-[#0a66c2]" />
                        </div>
                        <p className="text-lg font-medium text-white mb-2">
                          Drag & drop your CSV file here
                        </p>
                        <p className="text-sm text-[#b0b0b0]">
                          or click to browse
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="file"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-[#057642]/10 flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-[#057642]" />
                        </div>
                        <p className="text-lg font-medium text-[#057642] mb-1">
                          {file.name}
                        </p>
                        <p className="text-sm text-[#b0b0b0]">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Progress States */}
                <AnimatePresence>
                  {uploadState !== 'idle' && uploadState !== 'error' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 card-linkedin p-6"
                    >
                      <div className="space-y-4">
                        {/* Upload step */}
                        <div className="flex items-center gap-3">
                          {uploadState === 'uploading' ? (
                            <Loader2 className="w-5 h-5 text-[#0a66c2] animate-spin" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-[#057642]" />
                          )}
                          <span className={uploadState === 'uploading' ? 'text-white' : 'text-[#b0b0b0]'}>
                            Uploading and parsing CSV...
                          </span>
                        </div>

                        {/* Geocoding step */}
                        <div className="flex items-center gap-3">
                          {uploadState === 'geocoding' ? (
                            <Loader2 className="w-5 h-5 text-[#0a66c2] animate-spin" />
                          ) : uploadState === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-[#057642]" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-[#38434f]" />
                          )}
                          <span className={uploadState === 'geocoding' ? 'text-white' : 'text-[#b0b0b0]'}>
                            {uploadState === 'geocoding' 
                              ? `Mapping locations... (${geocodeProgress.processed} done)`
                              : uploadState === 'success'
                              ? `Mapped ${geocodeProgress.processed} connections`
                              : 'Mapping locations...'}
                          </span>
                        </div>

                        {/* Success */}
                        {uploadState === 'success' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="pt-4 border-t border-[#38434f]"
                          >
                            <div className="flex items-center gap-2 text-[#057642] mb-4">
                              <Globe className="w-5 h-5" />
                              <span className="font-medium">Your network is ready!</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => router.push('/dashboard')}
                              className="btn-linkedin w-full flex items-center justify-center gap-2 group"
                            >
                              View Your Network
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error State */}
                {uploadState === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-lg bg-[#b24020]/10 border border-[#b24020]/20 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-[#b24020] flex-shrink-0" />
                    <span className="text-[#b24020]">{message}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                {uploadState === 'idle' && (
                  <motion.button
                    type="submit"
                    disabled={!file}
                    whileHover={{ scale: file ? 1.02 : 1 }}
                    whileTap={{ scale: file ? 0.98 : 1 }}
                    className="mt-6 btn-linkedin w-full flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload & Process
                  </motion.button>
                )}
              </form>

              {/* Privacy Note */}
              <p className="text-center text-sm text-[#666666] mt-6">
                🔒 Your data is processed locally and never shared.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
