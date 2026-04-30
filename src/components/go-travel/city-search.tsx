'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { indianCities, type IndianCity } from '@/data/mock-data';

interface CitySearchInputProps {
  value: string;
  onChange: (cityName: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function CitySearchInput({
  value,
  onChange,
  placeholder = 'Search city...',
  label,
  className = '',
}: CitySearchInputProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep query in sync with value prop
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredCities = useMemo(() => {
    if (!query.trim()) return indianCities.slice(0, 20);
    const q = query.toLowerCase();
    return indianCities.filter(
      (city) =>
        city.name.toLowerCase().includes(q) ||
        city.state.toLowerCase().includes(q) ||
        city.code.toLowerCase().includes(q) ||
        (city.station && city.station.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [query]);

  const selectCity = useCallback(
    (city: IndianCity) => {
      onChange(city.name);
      setQuery(city.name);
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    },
    [onChange]
  );

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[data-city-item]');
      const item = items[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCities.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCities.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCities[highlightedIndex]) {
          selectCity(filteredCities[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const showBadge = (city: IndianCity) => {
    const badges: string[] = [];
    if (city.code) badges.push(city.code);
    if (city.station && city.station !== city.code) badges.push(city.station);
    return badges;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="text-xs font-semibold mb-1 block text-inherit">
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-[9999] max-h-64 overflow-y-auto animate-fade-in-down"
          style={{ animationDuration: '0.15s' }}
        >
          {filteredCities.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              <MapPin className="w-5 h-5 mx-auto mb-1.5 text-gray-300" />
              No cities found
            </div>
          ) : (
            filteredCities.map((city, idx) => {
              const badges = showBadge(city);
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={`${city.name}-${city.state}`}
                  data-city-item
                  type="button"
                  onClick={() => selectCity(city)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${
                    isHighlighted
                      ? 'bg-emerald-50'
                      : 'hover:bg-gray-50'
                  } ${idx === 0 ? 'rounded-t-xl' : ''} ${
                    idx === filteredCities.length - 1 ? 'rounded-b-xl' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {city.name}
                      </span>
                      {badges.length > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {badges.map((badge) => (
                            <span
                              key={badge}
                              className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 truncate block">
                      {city.state}
                    </span>
                  </div>
                  {isHighlighted && (
                    <span className="text-xs text-emerald-600 flex-shrink-0">
                      Press Enter ↵
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
