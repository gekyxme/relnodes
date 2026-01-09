'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, CheckCircle, Globe, X, AlertTriangle } from 'lucide-react';

interface Props {
  pendingCount: number;
  totalCount: number;
  autoStart?: boolean;
  onComplete?: (mapped: number, failed: number) => void;
}

export default function GeocodingProgress({ pendingCount, totalCount, autoStart = false, onComplete }: Props) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const hasStarted = useRef(false);

  const runGeocoding = useCallback(async () => {
    if (isRunning || pendingCount === 0) return;
    
    setIsRunning(true);
    setIsComplete(false);
    setSuccessCount(0);
    setAttemptedCount(0);

    let totalSuccess = 0;
    let totalAttempted = 0;
    let consecutiveEmpty = 0;

    while (consecutiveEmpty < 3) { // Stop after 3 batches with no success
      try {
        const res = await fetch('/api/geocode');
        const data = await res.json();
        
        // No more to process
        if (data.processed === 0 || data.message?.includes('No pending')) {
          break;
        }
        
        const batchSuccess = data.updated || 0;
        const batchProcessed = data.processed || 0;
        
        totalSuccess += batchSuccess;
        totalAttempted += batchProcessed;
        
        setSuccessCount(totalSuccess);
        setAttemptedCount(totalAttempted);
        
        // Track consecutive empty batches (processed but no success)
        if (batchSuccess === 0) {
          consecutiveEmpty++;
        } else {
          consecutiveEmpty = 0;
        }
        
        // Refresh the page data to update the globe
        router.refresh();
        
      } catch (error) {
        console.error('Geocoding error:', error);
        break;
      }
    }

    setIsRunning(false);
    setIsComplete(true);
    
    // Callback with results
    if (onComplete) {
      onComplete(totalSuccess, totalAttempted - totalSuccess);
    }
    
    router.refresh();
  }, [isRunning, pendingCount, router, onComplete]);

  // Auto-start if triggered from upload redirect (only once)
  useEffect(() => {
    if (autoStart && pendingCount > 0 && !hasStarted.current) {
      hasStarted.current = true;
      runGeocoding();
    }
  }, [autoStart, pendingCount, runGeocoding]);

  // Don't show if dismissed or no pending and not complete
  if (dismissed || (pendingCount === 0 && !isRunning && !isComplete)) {
    return null;
  }

  const mappedCount = totalCount - pendingCount + successCount;
  const progress = totalCount > 0 ? (mappedCount / totalCount) * 100 : 0;
  const failedCount = attemptedCount - successCount;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-80"
      >
        <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isRunning ? (
                <div className="w-8 h-8 rounded-full bg-[#0a66c2]/20 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-[#0a66c2] animate-spin" />
                </div>
              ) : isComplete ? (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  failedCount > 0 ? 'bg-red-500/20' : 'bg-green-500/20'
                }`}>
                  {failedCount > 0 ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white/60" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-white">
                  {isComplete 
                    ? (failedCount > 0 ? 'Mapping Finished' : 'Mapping Complete!')
                    : isRunning 
                    ? 'Mapping Locations' 
                    : 'Location Mapping'}
                </h4>
                <p className="text-xs text-white/50">
                  {isComplete 
                    ? (failedCount > 0 
                        ? `${successCount} mapped, ${failedCount} couldn't be found`
                        : `${successCount} connections mapped`)
                    : isRunning 
                    ? `${successCount} mapped so far...`
                    : `${pendingCount} connections need locations`}
                </p>
              </div>
            </div>
            {(isComplete || !isRunning) && (
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {(isRunning || isComplete) && (
            <div className="mb-3">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    isComplete 
                      ? (failedCount > 0 ? 'bg-red-500' : 'bg-green-500')
                      : 'bg-[#0a66c2]'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-white/40">
                  {isRunning ? `${successCount} mapped` : `${Math.round(progress)}%`}
                </span>
                <span className="text-xs text-white/40">
                  {mappedCount} / {totalCount}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!isRunning && !isComplete && pendingCount > 0 && (
            <button
              onClick={runGeocoding}
              className="w-full py-2.5 text-sm flex items-center justify-center gap-2 bg-[#0a66c2] hover:bg-[#004182] text-white font-medium rounded-xl transition-colors"
            >
              <Globe className="w-4 h-4" />
              Start Auto-Mapping
            </button>
          )}

          {/* Info Text */}
          {isRunning && (
            <p className="text-xs text-white/40 text-center">
              You can continue using the app while mapping runs
            </p>
          )}

          {isComplete && failedCount > 0 && (
            <p className="text-xs text-white/50 text-center mb-2">
              Some companies couldn&apos;t be located. Set locations manually in All Connections.
            </p>
          )}

          {isComplete && (
            <button
              onClick={() => setDismissed(true)}
              className="w-full py-2 text-sm text-[#0a66c2] hover:text-[#70b5f9] transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
