import React, { useMemo } from 'react';
import { Globe2, Plus } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import type { Country } from '../../../services/locations.api';

interface CountrySelectorProps {
  countries: Country[];
  selectedCountryId: string;
  onSelect: (countryId: string) => void;
  onCreateCountry?: () => void;
  canManage?: boolean;
  loading?: boolean;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  countries,
  selectedCountryId,
  onSelect,
  onCreateCountry,
  canManage,
  loading,
}) => {
  const options = useMemo(
    () =>
      countries.map((country) => ({
        value: country.id,
        label: country.code ? `${country.name} (${country.code})` : country.name,
      })),
    [countries],
  );

  return (
    <div className="rounded-[1.35rem] border border-white/70 bg-white/80 p-4 shadow-[0_20px_50px_-30px_rgba(109,40,217,0.25)] backdrop-blur sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-violet-600">
            <Globe2 className="h-3.5 w-3.5" />
            Country
          </div>
          <h2 className="mt-3 text-xl font-black text-slate-900">Select a Country</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Choose the country whose hierarchy you want to manage.</p>
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={onCreateCountry}
            className="inline-flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-2.5 text-sm font-black text-violet-600 transition-colors hover:bg-violet-100"
          >
            <Plus className="h-4 w-4" />
            Add Country
          </button>
        ) : null}
      </div>

      <SearchableSelect
        options={options}
        value={selectedCountryId}
        onChange={(event) => onSelect(event.target.value)}
        placeholder={loading ? 'Loading countries...' : 'Select a country'}
        name="country"
      />
    </div>
  );
};

export default CountrySelector;
