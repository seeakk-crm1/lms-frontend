import { useMemo } from 'react';
import { useActiveLOBReasonsQuery } from '../modules/lob-reasons/hooks/useLOBReasonsQuery';
import type { LeadOption } from '../types/lead.types';

export const mapActiveLobReasonsToOptions = (
  reasons: Array<{ id: string; name: string; status?: string }> = [],
): Array<{ value: string; label: string }> =>
  reasons
    .filter((reason) => !reason.status || reason.status === 'ACTIVE')
    .map((reason) => ({ value: reason.id, label: reason.name }));

export const useActiveLOBReasonOptions = (enabled: boolean, metaReasons: LeadOption[] = []) => {
  const shouldFetch = enabled && metaReasons.length === 0;
  const activeQuery = useActiveLOBReasonsQuery(shouldFetch);

  const options = useMemo(() => {
    const fromMeta = mapActiveLobReasonsToOptions(
      metaReasons.map((item) => ({ id: item.id, name: item.label, status: 'ACTIVE' })),
    );
    if (fromMeta.length) return fromMeta;
    return mapActiveLobReasonsToOptions(activeQuery.data || []);
  }, [activeQuery.data, metaReasons]);

  return {
    options,
    isLoading: shouldFetch && activeQuery.isLoading,
    isError: shouldFetch && activeQuery.isError,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
  };
};
