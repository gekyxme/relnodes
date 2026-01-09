'use client';

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, Info, ArrowLeft, Globe } from 'lucide-react';

// Dynamically import Threads
const Threads = dynamic(() => import('@/components/Threads'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />
});

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);

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
      setError('');
    } else {
      setError('Please upload a CSV file');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError('');
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
      setUploadSuccess(true);
      setMessage(`Successfully imported ${result.count} connections!`);
      
      setTimeout(() => {
        router.push('/dashboard?geocoding=true');
      }, 1500);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
    }
  };

  const steps = [
    'Go to LinkedIn.com and click your profile picture',
    'Select "Settings & Privacy"',
    'Go to "Data Privacy" → "Get a copy of your data"',
    'Choose "Connections" and request archive',
    'Download and extract the ZIP file',
    'Upload the Connections.csv file here'
  ];

  return (
    <div className="relative min-h-screen bg-black">
      {/* Threads Background */}
      <div className="fixed inset-0 z-0">
        <Threads
          color={[0.039, 0.404, 0.761]}
          amplitude={1.2}
          distance={0.3}
          enableMouseInteraction={true}
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/50 to-black/80 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0a66c2]/20 backdrop-blur-sm border border-[#0a66c2]/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#0a66c2]" />
              </div>
              <span className="text-xl font-bold text-white">Relnodes</span>
            </Link>
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Upload Your Connections
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Export your LinkedIn connections and upload the CSV file to visualize your network on the globe.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Instructions Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#0a66c2]/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-[#0a66c2]" />
                </div>
                <h3 className="font-semibold text-white text-lg">How to export from LinkedIn</h3>
              </div>
              
              <ol className="space-y-4">
                {steps.map((step, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#0a66c2]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-[#0a66c2]">{i + 1}</span>
                    </div>
                    <span className="text-white/70 text-sm leading-relaxed">{step}</span>
                  </motion.li>
                ))}
              </ol>

              <div className="mt-6 p-4 rounded-xl bg-[#0a66c2]/10 border border-[#0a66c2]/20">
                <p className="text-sm text-[#70b5f9]">
                  💡 After upload, you&apos;ll be taken to your dashboard where locations will be mapped automatically.
                </p>
              </div>
            </motion.div>

            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="h-full flex flex-col">
                {/* Dropzone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    relative flex-1 min-h-[300px] rounded-2xl bg-white/5 backdrop-blur-md border-2 border-dashed
                    flex items-center justify-center cursor-pointer transition-all
                    ${dragActive 
                      ? 'border-[#0a66c2] bg-[#0a66c2]/10' 
                      : file 
                        ? 'border-green-500/50 bg-green-500/5'
                        : uploadSuccess 
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/20 hover:border-white/40 hover:bg-white/10'}
                  `}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading || uploadSuccess}
                  />
                  
                  <AnimatePresence mode="wait">
                    {uploadSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center p-6"
                      >
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <p className="text-xl font-semibold text-green-400 mb-2">
                          {uploadedCount} connections imported!
                        </p>
                        <p className="text-white/60">
                          Redirecting to dashboard...
                        </p>
                      </motion.div>
                    ) : isUploading ? (
                      <motion.div
                        key="uploading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center p-6"
                      >
                        <div className="w-20 h-20 rounded-full bg-[#0a66c2]/20 flex items-center justify-center mx-auto mb-4">
                          <Loader2 className="w-10 h-10 text-[#0a66c2] animate-spin" />
                        </div>
                        <p className="text-xl font-semibold text-white mb-2">
                          Processing your connections...
                        </p>
                        <p className="text-white/60">
                          This will only take a moment
                        </p>
                      </motion.div>
                    ) : file ? (
                      <motion.div
                        key="file"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center p-6"
                      >
                        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-10 h-10 text-green-500" />
                        </div>
                        <p className="text-xl font-semibold text-green-400 mb-1">
                          {file.name}
                        </p>
                        <p className="text-white/60">
                          {(file.size / 1024).toFixed(1)} KB • Ready to upload
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center p-6"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-10 h-10 text-white/60" />
                        </div>
                        <p className="text-xl font-semibold text-white mb-2">
                          Drag & drop your CSV file
                        </p>
                        <p className="text-white/60">
                          or click to browse
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error State */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-400">{error}</span>
                  </motion.div>
                )}

                {/* Success Message */}
                {message && !error && !uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-green-400">{message}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                {!uploadSuccess && (
                  <motion.button
                    type="submit"
                    disabled={!file || isUploading}
                    whileHover={{ scale: file && !isUploading ? 1.02 : 1 }}
                    whileTap={{ scale: file && !isUploading ? 0.98 : 1 }}
                    className="mt-4 w-full py-4 bg-[#0a66c2] hover:bg-[#004182] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload & Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                )}
              </form>

              {/* Privacy Note */}
              <p className="text-center text-sm text-white/40 mt-4">
                 Your data is processed securely and never shared.
              </p>
            </motion.div>
          </div>

          {/* Back to home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
