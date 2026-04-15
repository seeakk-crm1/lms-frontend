import React, { useState, useRef, useEffect, useMemo, ChangeEvent } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (e: { target: { name: string; value: string } }) => void;
    placeholder: string;
    name: string;
    allowClear?: boolean;
    clearLabel?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder,
    name,
    allowClear = false,
    clearLabel = 'None',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Options are expected to be { value, label } objects
    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opt.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, options]);

    const clearOption = useMemo<Option | null>(() => {
        if (!allowClear) return null;
        return { value: '', label: clearLabel };
    }, [allowClear, clearLabel]);

    const visibleOptions = useMemo(() => {
        const base = filteredOptions;
        if (!clearOption) return base;
        // Show clear option first (especially helpful after selection)
        return [clearOption, ...base];
    }, [clearOption, filteredOptions]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div
                className={`w-full px-4 py-2.5 bg-gray-50 border ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200'} text-gray-900 rounded-xl text-sm transition-all font-medium cursor-pointer flex justify-between items-center`}
                onClick={() => {
                    setIsOpen(!isOpen);
                    setSearchTerm(''); // Reset search on open
                }}
            >
                <span className={selectedOption ? "text-gray-900 truncate" : "text-gray-400"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[250px]"
                    >
                        <div className="flex items-center px-3 py-3 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10 shrink-0">
                            <Search size={14} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                className="w-full bg-transparent border-none focus:outline-none text-sm font-medium text-gray-700"
                                placeholder={`Search...`}
                                value={searchTerm}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                        <div className="overflow-y-auto p-1 flex-1" style={{ scrollbarWidth: 'thin' }}>
                            {visibleOptions.length > 0 ? (
                                visibleOptions.map((opt) => (
                                    <div
                                        key={`${opt.value || '__clear__'}:${opt.label}`}
                                        className={`px-3 py-2.5 my-0.5 text-sm rounded-lg cursor-pointer flex justify-between items-center transition-colors ${value === opt.value ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}
                                        onClick={() => {
                                            onChange({ target: { name, value: opt.value } });
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span className="truncate pr-4">{opt.label}</span>
                                        {value === opt.value && <Check size={14} className="text-emerald-500 flex-shrink-0" />}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-sm text-gray-500 text-center font-medium">No options found for "{searchTerm}"</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchableSelect;
