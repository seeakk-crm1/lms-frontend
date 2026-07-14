import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getCountryDataList, CountryPhoneData } from '../../utils/phoneUtils';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ChevronDown, Search } from 'lucide-react';

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export default function PhoneInput({ value = '', onChange, error = false, disabled = false }: PhoneInputProps) {
  const countries = useMemo(() => getCountryDataList(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse value to find matching country and national number
  const parsedState = useMemo(() => {
    if (!value || !value.startsWith('+')) {
      // Default to India
      const defaultCountry = countries.find(c => c.isoCode === 'IN') || countries[0];
      return {
        country: defaultCountry,
        nationalNumber: value.replace(/\D/g, '') // Keep digits if any
      };
    }

    const parsed = parsePhoneNumberFromString(value);
    if (parsed && parsed.country) {
      const matched = countries.find(c => c.isoCode === parsed.country);
      if (matched) {
        return {
          country: matched,
          nationalNumber: parsed.nationalNumber
        };
      }
    }

    // Fallback: match by dial code prefix
    const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sortedCountries) {
      if (value.startsWith(c.dialCode)) {
        return {
          country: c,
          nationalNumber: value.slice(c.dialCode.length)
        };
      }
    }

    const defaultCountry = countries.find(c => c.isoCode === 'IN') || countries[0];
    return {
      country: defaultCountry,
      nationalNumber: value.replace(/\D/g, '')
    };
  }, [value, countries]);

  const selectedCountry = parsedState.country;
  const nationalNumber = parsedState.nationalNumber;

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return countries;
    const term = search.toLowerCase().trim();
    return countries.filter(
      c =>
        c.name.toLowerCase().includes(term) ||
        c.dialCode.includes(term) ||
        c.isoCode.toLowerCase().includes(term)
    );
  }, [countries, search]);

  const handleCountrySelect = (country: CountryPhoneData) => {
    const fullValue = nationalNumber ? `${country.dialCode}${nationalNumber}` : '';
    onChange(fullValue);
    setIsOpen(false);
    setSearch('');
  };

  const handleNationalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Digits only
    const fullValue = val ? `${selectedCountry.dialCode}${val}` : '';
    onChange(fullValue);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`flex items-center w-full rounded-2xl border bg-gray-50 text-sm font-semibold transition-all focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 ${
          error ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
        } ${disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
      >
        {/* Country Flag Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-3 hover:bg-gray-100/80 rounded-l-2xl border-r border-gray-200 text-gray-700 shrink-0 transition-colors"
          disabled={disabled}
        >
          <span className="text-xl leading-none select-none">{selectedCountry.flag}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {/* Dial Code Prefix Display */}
        <span className="pl-3 pr-2 text-gray-500 select-none shrink-0 font-bold">
          {selectedCountry.dialCode}
        </span>

        {/* Vertical divider line */}
        <div className="h-6 w-[1px] bg-gray-200" />

        {/* Mobile Number Input */}
        <input
          type="text"
          value={nationalNumber}
          onChange={handleNationalNumberChange}
          placeholder="Mobile Number"
          className="w-full bg-transparent px-3 py-3 text-gray-900 outline-none placeholder:text-gray-400 font-semibold"
          disabled={disabled}
        />
      </div>

      {/* Country List Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 max-h-80 bg-white border border-gray-150 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Area */}
          <div className="relative p-2.5 border-b border-gray-100 shrink-0">
            <Search className="absolute left-5.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto max-h-60 custom-scrollbar p-1.5 space-y-0.5">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(c => (
                <button
                  key={`${c.isoCode}-${c.dialCode}`}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                    selectedCountry.isoCode === c.isoCode
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-lg leading-none select-none shrink-0">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="text-gray-400 shrink-0 font-bold ml-2">{c.dialCode}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs font-bold text-gray-400">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
