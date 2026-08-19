import { useState, useEffect, useMemo, useCallback } from 'react';
import useAuthStore from '../store/useAuthStore';
import {
  ColumnDefinition,
  STANDARD_TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMN_KEYS,
} from '../types/leadColumns.types';

export function useLeadTableColumns(dynamicFields: Array<{ id: string; name: string; inputType: string }> = []) {
  const currentUser = useAuthStore((state) => state.user);

  const storageKey = useMemo(() => {
    const userId = currentUser?.id || 'guest';
    const workspaceId = currentUser?.workspaceId || 'default';
    return `seeakk.leadTableColumns.${userId}.${workspaceId}`;
  }, [currentUser?.id, currentUser?.workspaceId]);

  const allColumns = useMemo<ColumnDefinition[]>(() => {
    const customCols: ColumnDefinition[] = dynamicFields.map((df) => ({
      key: `custom_field:${df.id}`,
      label: df.name,
      category: 'CUSTOM',
      fieldId: df.id,
      inputType: df.inputType,
    }));

    return [...STANDARD_TABLE_COLUMNS, ...customCols];
  }, [dynamicFields]);

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return new Set<string>(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
    return new Set<string>(DEFAULT_VISIBLE_COLUMN_KEYS);
  });

  // Re-sync with localStorage when storageKey changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedKeys(new Set<string>(parsed));
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    setSelectedKeys(new Set<string>(DEFAULT_VISIBLE_COLUMN_KEYS));
  }, [storageKey]);

  const visibleColumns = useMemo(() => {
    return allColumns.filter((col) => col.isRequired || selectedKeys.has(col.key));
  }, [allColumns, selectedKeys]);

  const toggleColumn = useCallback((key: string) => {
    const col = STANDARD_TABLE_COLUMNS.find((c) => c.key === key);
    if (col?.isRequired) return; // Locked

    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const saveColumns = useCallback((keysToSave: string[]) => {
    try {
      const uniqueKeys = Array.from(new Set(keysToSave));
      localStorage.setItem(storageKey, JSON.stringify(uniqueKeys));
      setSelectedKeys(new Set(uniqueKeys));
    } catch (e) {
      // ignore
    }
  }, [storageKey]);

  const resetToDefault = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      // ignore
    }
    setSelectedKeys(new Set(DEFAULT_VISIBLE_COLUMN_KEYS));
  }, [storageKey]);

  return {
    allColumns,
    visibleColumns,
    selectedKeys,
    toggleColumn,
    saveColumns,
    resetToDefault,
  };
}
