import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchableSelect, { type Option } from './SearchableSelect';
import { getOffices } from '../services/users.api';
import type { Office } from '../types/admin/office/office.types';

type OfficeFilterSelectProps = {
  value?: string;
  onChange: (officeId?: string) => void;
  placeholder?: string;
  name?: string;
};

const formatOfficeLocation = (office: Office): string => {
  const parts = [office.city, office.district, office.state, office.country]
    .map((part) => part?.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : office.address?.trim() || '';
};

export const formatOfficeOptionLabel = (office: Office): string => {
  const location = formatOfficeLocation(office);
  return location ? `${office.name} - ${location}` : office.name;
};

const OfficeFilterSelect: React.FC<OfficeFilterSelectProps> = ({
  value = '',
  onChange,
  placeholder = 'Office Location',
  name = 'officeId',
}) => {
  const officesQuery = useQuery({
    queryKey: ['office-filter-options'],
    queryFn: getOffices,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const options = useMemo<Option[]>(
    () =>
      ((officesQuery.data?.offices || []) as Office[])
        .filter((office) => office.id && office.isActive !== false)
        .map((office) => ({
          value: office.id,
          label: formatOfficeOptionLabel(office),
        })),
    [officesQuery.data],
  );

  return (
    <SearchableSelect
      name={name}
      value={value}
      options={options}
      placeholder={officesQuery.isLoading ? 'Loading offices...' : placeholder}
      allowClear
      clearLabel="All Offices"
      onChange={(event) => onChange(event.target.value || undefined)}
    />
  );
};

export default OfficeFilterSelect;
