'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Loader2 } from 'lucide-react';
import CityAutocomplete from './CityAutocomplete';
import { City } from '@/lib/cities';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: { latitude: number; longitude: number; city: string; country: string }) => void;
}

export default function LocationPromptModal({ isOpen, onClose, onSave }: Props) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleSave = async () => {
    if (!selectedCity) {
      setError('Please select a city');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/user/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: selectedCity.lat,
          longitude: selectedCity.lng,
          city: selectedCity.name,
          country: selectedCity.country,
        }),
      });

      if (res.ok) {
        onSave({
          latitude: selectedCity.lat,
          longitude: selectedCity.lng,
          city: selectedCity.name,
          country: selectedCity.country,
        });
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save location');
      }
    } catch (err) {
      console.error('Failed to save location:', err);
      setError('Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode to get city name
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`,
            { headers: { 'User-Agent': 'Relnodes/1.0' } }
          );
          const data = await res.json();
          
          const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
          const country = data.address?.country || 'Unknown';
          
          setSelectedCity({
            name: city,
            country: country,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        } catch (err) {
          console.error('Reverse geocoding failed:', err);
          setError('Could not determine your city. Please search manually.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Could not detect your location. Please search manually.');
        setDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="card-linkedin w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-[#38434f]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0a66c2]/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#0a66c2]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Set Your Location</h2>
                      <p className="text-sm text-[#b0b0b0]">Where are you based?</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-[#38434f] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[#b0b0b0]" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-[#b0b0b0]">
                  Your location is used to show connection lines from you to your network on the globe. 
                  This helps visualize your reach across the world.
                </p>

                {/* Detect Location Button */}
                <button
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#38434f]/50 hover:bg-[#38434f] text-white transition-colors disabled:opacity-50"
                >
                  {detectingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Detect My Location
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#38434f]" />
                  <span className="text-xs text-[#666666]">or search</span>
                  <div className="flex-1 h-px bg-[#38434f]" />
                </div>

                {/* City Search */}
                <CityAutocomplete
                  value={selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : ''}
                  onChange={setSelectedCity}
                />

                {/* Selected City Preview */}
                {selectedCity && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#0a66c2]/10 border border-[#0a66c2]/30"
                  >
                    <MapPin className="w-5 h-5 text-[#0a66c2]" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{selectedCity.name}</div>
                      <div className="text-xs text-[#b0b0b0]">{selectedCity.country}</div>
                    </div>
                    <button
                      onClick={() => setSelectedCity(null)}
                      className="p-1 hover:bg-[#38434f] rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-[#b0b0b0]" />
                    </button>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 btn-linkedin-secondary"
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedCity}
                  className="flex-1 btn-linkedin disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

