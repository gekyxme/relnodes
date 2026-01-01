'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, X } from 'lucide-react';
import { searchCities, City } from '@/lib/cities';

interface Props {
  value: string;
  onChange: (city: City | null, displayValue: string) => void;
  placeholder?: string;
}

export default function CityAutocomplete({ value, onChange, placeholder = "Search for a city..." }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const cities = searchCities(query);
    setResults(cities);
    setHighlightedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: City) => {
    const displayValue = `${city.name}, ${city.country}`;
    setQuery(displayValue);
    onChange(city, displayValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(results[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange(null, '');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-[#1d2226] border border-[#38434f] rounded-lg py-3 pl-10 pr-10 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#38434f] rounded transition-colors"
          >
            <X className="w-4 h-4 text-[#666666]" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="autocomplete-dropdown mt-1">
          {results.map((city, index) => (
            <button
              key={`${city.name}-${city.country}`}
              onClick={() => handleSelect(city)}
              className={`
                autocomplete-item w-full text-left flex items-center gap-3
                ${index === highlightedIndex ? 'bg-[#0a66c2]/10' : ''}
              `}
            >
              <MapPin className="w-4 h-4 text-[#0a66c2] flex-shrink-0" />
              <div>
                <div className="font-medium text-white">{city.name}</div>
                <div className="text-sm text-[#b0b0b0]">{city.country}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="autocomplete-dropdown mt-1 p-4 text-center text-[#b0b0b0] text-sm">
          No cities found. Try a different search.
        </div>
      )}
    </div>
  );
}

