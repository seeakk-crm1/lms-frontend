import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Minus, Plus, Package, Search, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useLeadMetaQuery } from '../../../hooks/useLeads';
import { updateLead } from '../../../services/leads.api';

import { formatCurrency } from '../../../utils/currency';

interface SheetProductModalProps {
  isOpen: boolean;
  leadId?: string;
  leadName?: string;
  initialValue?: string | null;
  onClose: () => void;
  onSaved: (formattedText: string, updatedLead: any) => void;
}

interface SelectedItem {
  productId: string;
  quantity: number;
}

const SheetProductModal: React.FC<SheetProductModalProps> = ({
  isOpen,
  leadId,
  leadName,
  initialValue,
  onClose,
  onSaved,
}) => {
  const queryClient = useQueryClient();
  const { data: metaData, isLoading: isMetaLoading } = useLeadMetaQuery(isOpen);
  const productsList = useMemo(() => metaData?.products || [], [metaData]);

  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setSearch('');
    if (!initialValue || !initialValue.trim() || !productsList.length) {
      setSelectedItems([]);
      return;
    }

    const items: SelectedItem[] = [];
    const segments = initialValue.split(/[,;]/);
    for (const segment of segments) {
      const match = segment.match(/(.*?)(?:[×x*]\s*(\d+)|$)/i);
      if (match) {
        const rawName = match[1]?.trim().toLowerCase();
        const qty = match[2] ? parseInt(match[2], 10) : 1;
        if (rawName) {
          const matchedProd = productsList.find(
            (p: any) => p.name.toLowerCase() === rawName || p.id === rawName,
          );
          if (matchedProd && !items.some((i) => i.productId === matchedProd.id)) {
            items.push({ productId: matchedProd.id, quantity: Math.max(1, qty) });
          }
        }
      }
    }
    setSelectedItems(items);
  }, [isOpen, initialValue, productsList]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return productsList;
    const term = search.toLowerCase().trim();
    return productsList.filter(
      (p: any) =>
        p.name.toLowerCase().includes(term) || (p.code && p.code.toLowerCase().includes(term)),
    );
  }, [productsList, search]);

  const selectedMap = useMemo(() => {
    const map = new Map<string, number>();
    selectedItems.forEach((item) => map.set(item.productId, item.quantity));
    return map;
  }, [selectedItems]);

  const liveTotal = useMemo(() => {
    let total = 0;
    selectedItems.forEach((item) => {
      const prod = productsList.find((p: any) => p.id === item.productId);
      if (prod) {
        total += Number(prod.unitPrice || 0) * item.quantity;
      }
    });
    return total;
  }, [selectedItems, productsList]);

  const toggleSelect = (productId: string) => {
    setSelectedItems((prev) => {
      const exists = prev.some((i) => i.productId === productId);
      if (exists) {
        return prev.filter((i) => i.productId !== productId);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const nextQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: nextQty };
        }
        return item;
      }),
    );
  };

  const setQuantityDirect = (productId: string, val: number) => {
    const safeQty = Math.max(1, Math.trunc(val) || 1);
    setSelectedItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: safeQty } : item)),
    );
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!leadId) throw new Error('No lead ID associated with this row.');
      const payloadProducts = selectedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      return updateLead(leadId, { products: payloadProducts } as any);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      const formatted = selectedItems
        .map((item) => {
          const prod = productsList.find((p: any) => p.id === item.productId);
          return `${prod?.name || 'Product'} ×${item.quantity}`;
        })
        .join(', ');

      const nextLead = response?.approvalRequired ? response?.data?.lead : response?.data;
      onSaved(formatted, nextLead);
      toast.success('Products updated successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update products');
    },
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/55 backdrop-blur-sm"
            aria-label="Close product selector"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative w-full max-w-lg rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-500" />
                <div>
                  <h3 className="text-lg font-black text-gray-900">Select Products</h3>
                  {leadName && <p className="text-xs font-semibold text-gray-500">{leadName}</p>}
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-5 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Products List */}
              {isMetaLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm font-semibold">Loading active products...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-sm font-semibold text-gray-400">
                  No active products found.
                </div>
              ) : (
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {filteredProducts.map((product: any) => {
                    const isSelected = selectedMap.has(product.id);
                    const qty = selectedMap.get(product.id) || 1;
                    const price = Number(product.unitPrice || 0);

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(product.id)}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                            <p className="text-xs font-medium text-gray-400">
                              {formatCurrency(price)} {product.code ? `• ${product.code}` : ''}
                            </p>
                          </div>
                        </label>

                        {isSelected && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, -1)}
                              className="h-8 w-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={qty}
                              onChange={(e) => setQuantityDirect(product.id, parseInt(e.target.value, 10))}
                              className="w-12 text-center text-sm font-bold text-gray-800 border border-gray-200 rounded-xl py-1 outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, 1)}
                              className="h-8 w-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Summary Bar */}
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Selected Products</p>
                  <p className="text-sm font-extrabold text-gray-800">{selectedItems.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Live Total Amount</p>
                  <p className="text-base font-black text-emerald-600">{formatCurrency(liveTotal)}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Products
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(SheetProductModal);
