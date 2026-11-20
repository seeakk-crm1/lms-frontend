import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Package, Plus, Power, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { createProduct, deleteProduct, getProducts, toggleProductStatus, updateProduct } from '../services/products.api';
import type { Product, ProductInput, ProductStatus, ProductTypeOption } from '../types/product.types';
import { formatCurrency } from '../utils/currency';

const emptyForm: ProductInput = {
  name: '',
  code: '',
  category: '',
  categories: [],
  types: [],
  typeOptions: [],
  description: '',
  unitPrice: 0,
  status: 'ACTIVE',
};

const parseStringArray = (val: unknown): string[] => {
  if (Array.isArray(val)) {
    return val.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
  }
  if (typeof val === 'string' && val.trim().length > 0) {
    if (val.trim().startsWith('[') && val.trim().endsWith(']')) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
      } catch {}
    }
    return [val.trim()];
  }
  return [];
};

const ProductListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [categoryInput, setCategoryInput] = useState('');

  const productsQuery = useQuery({
    queryKey: ['products', search, status, page],
    queryFn: () => getProducts({ page, limit: 10, search, status: status || undefined }),
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const saveMutation = useMutation({
    mutationFn: () => {
      let currentCategories = [...(form.categories || [])];
      const pendingCat = categoryInput.trim();
      if (pendingCat && !currentCategories.some((c) => c.toLowerCase() === pendingCat.toLowerCase())) {
        currentCategories.push(pendingCat);
      }

      const sanitizedCategories = Array.from(
        new Set(currentCategories.map((c) => c.trim()).filter(Boolean)),
      );

      const rawTypeOptions = form.typeOptions || [];
      // Validate non-empty names
      for (let i = 0; i < rawTypeOptions.length; i++) {
        if (!rawTypeOptions[i].name.trim()) {
          throw new Error(`Type row #${i + 1} must have a name.`);
        }
      }

      // Check duplicates
      const seenNames = new Set<string>();
      for (const opt of rawTypeOptions) {
        const lower = opt.name.trim().toLowerCase();
        if (seenNames.has(lower)) {
          throw new Error(`Duplicate type name "${opt.name.trim()}". Each type name must be unique.`);
        }
        seenNames.add(lower);
      }

      const sanitizedTypeOptions: ProductTypeOption[] = rawTypeOptions.map((opt, idx) => ({
        id: opt.id || `type-${idx}-${Date.now()}`,
        name: opt.name.trim(),
        unitPrice: Math.max(0, Number(opt.unitPrice) || 0),
        status: opt.status || 'ACTIVE',
        isDefault: Boolean(opt.isDefault),
      }));

      if (sanitizedTypeOptions.length > 0 && !sanitizedTypeOptions.some((t) => t.isDefault)) {
        sanitizedTypeOptions[0].isDefault = true;
      }

      const defaultOption = sanitizedTypeOptions.find((t) => t.isDefault) || sanitizedTypeOptions[0];
      const baselineUnitPrice = defaultOption
        ? Number(defaultOption.unitPrice || 0)
        : Math.max(0, Number(form.unitPrice || 0));

      const payload: ProductInput = {
        name: form.name.trim(),
        code: form.code?.trim() || undefined,
        category: sanitizedCategories[0] || form.category?.trim() || undefined,
        categories: sanitizedCategories,
        types: sanitizedTypeOptions.map((t) => t.name),
        typeOptions: sanitizedTypeOptions,
        description: form.description?.trim() || undefined,
        unitPrice: baselineUnitPrice,
        status: form.status,
      };

      return editing ? updateProduct(editing.id, payload) : createProduct(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Product updated' : 'Product created');
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setCategoryInput('');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Could not save product';
      toast.error(msg);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleProductStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not delete product'),
  });

  const rows = productsQuery.data?.data || [];
  const pagination = productsQuery.data?.pagination;

  const canSave = useMemo(() => {
    if (!form.name.trim()) return false;
    const currentTypes = form.typeOptions || [];
    if (currentTypes.length > 0) {
      return currentTypes.every((t) => t.name.trim().length > 0 && Number(t.unitPrice) >= 0);
    }
    return Number(form.unitPrice) >= 0;
  }, [form.name, form.typeOptions, form.unitPrice]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setCategoryInput('');
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    const parsedCategories = parseStringArray(product.categories);
    const existingCategories =
      parsedCategories.length > 0
        ? parsedCategories
        : parseStringArray(product.category);

    let initialTypeOptions: ProductTypeOption[] = [];
    if (Array.isArray(product.typeOptions) && product.typeOptions.length > 0) {
      initialTypeOptions = product.typeOptions.map((t, idx) => ({
        id: t.id || `type-${idx}`,
        name: t.name,
        unitPrice: Number(t.unitPrice) || 0,
        status: t.status || 'ACTIVE',
        isDefault: Boolean(t.isDefault),
      }));
    } else if (Array.isArray(product.types) && product.types.length > 0) {
      initialTypeOptions = product.types.map((name, idx) => ({
        id: `type-${idx}`,
        name,
        unitPrice: Number(product.unitPrice) || 0,
        status: 'ACTIVE',
        isDefault: idx === 0,
      }));
    }

    if (initialTypeOptions.length > 0 && !initialTypeOptions.some((t) => t.isDefault)) {
      initialTypeOptions[0].isDefault = true;
    }

    setForm({
      name: product.name,
      code: product.code || '',
      category: product.category || existingCategories[0] || '',
      categories: existingCategories,
      types: Array.isArray(product.types) ? product.types : [],
      typeOptions: initialTypeOptions,
      description: product.description || '',
      unitPrice: product.unitPrice,
      status: product.status,
    });
    setCategoryInput('');
    setFormOpen(true);
  };

  const handleAddTypeRow = () => {
    const current = form.typeOptions || [];
    const isFirst = current.length === 0;
    const newRow: ProductTypeOption = {
      id: `type-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: '',
      unitPrice: form.unitPrice > 0 ? Number(form.unitPrice) : 0,
      status: 'ACTIVE',
      isDefault: isFirst,
    };
    const nextOptions = [...current, newRow];
    setForm((prev) => ({
      ...prev,
      typeOptions: nextOptions,
      types: nextOptions.map((t) => t.name).filter(Boolean),
      unitPrice: isFirst ? newRow.unitPrice : prev.unitPrice,
    }));
  };

  const handleUpdateTypeRow = (index: number, field: keyof ProductTypeOption, value: any) => {
    setForm((prev) => {
      const current = [...(prev.typeOptions || [])];
      if (!current[index]) return prev;
      const updatedItem = {
        ...current[index],
        [field]: field === 'unitPrice' ? (value === '' ? 0 : Math.max(0, Number(value) || 0)) : value,
      };
      current[index] = updatedItem;
      const defaultItem = current.find((t) => t.isDefault) || current[0];
      return {
        ...prev,
        typeOptions: current,
        types: current.map((t) => t.name).filter(Boolean),
        unitPrice: defaultItem ? Number(defaultItem.unitPrice || 0) : prev.unitPrice,
      };
    });
  };

  const handleSetDefaultType = (index: number) => {
    setForm((prev) => {
      const current = (prev.typeOptions || []).map((item, idx) => ({
        ...item,
        isDefault: idx === index,
        status: idx === index ? ('ACTIVE' as const) : item.status,
      }));
      const selected = current[index];
      return {
        ...prev,
        typeOptions: current,
        unitPrice: selected ? Number(selected.unitPrice || 0) : prev.unitPrice,
      };
    });
  };

  const handleRemoveTypeRow = (index: number) => {
    setForm((prev) => {
      const current = (prev.typeOptions || []).filter((_, idx) => idx !== index);
      if (current.length > 0 && !current.some((t) => t.isDefault)) {
        current[0].isDefault = true;
      }
      const defaultItem = current.find((t) => t.isDefault);
      return {
        ...prev,
        typeOptions: current,
        types: current.map((t) => t.name).filter(Boolean),
        unitPrice: defaultItem ? Number(defaultItem.unitPrice || 0) : prev.unitPrice,
      };
    });
  };

  const handleAddCategory = () => {
    const trimmed = categoryInput.trim();
    if (!trimmed) return;
    const currentCategories = form.categories || [];
    if (currentCategories.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Category "${trimmed}" already added.`);
      return;
    }
    const nextCategories = [...currentCategories, trimmed];
    setForm((prev) => ({
      ...prev,
      categories: nextCategories,
      category: nextCategories[0] || '',
    }));
    setCategoryInput('');
  };

  const handleRemoveCategory = (index: number) => {
    setForm((prev) => {
      const nextCategories = (prev.categories || []).filter((_, i) => i !== index);
      return {
        ...prev,
        categories: nextCategories,
        category: nextCategories[0] || '',
      };
    });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-[1280px] space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
                <Package className="h-3.5 w-3.5" />
                <span>Master Configuration</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Products</h1>
              <p className="mt-2 text-sm font-semibold text-gray-500">
                Manage selectable products, configurable categories, and type-based pricing for lead calculations.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-600 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products, code, category, type"
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as ProductStatus | '')}
                className="h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-black text-gray-700 outline-none transition focus:border-emerald-400 focus:bg-white"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Product Name', 'Product Code', 'Types & Pricing', 'Category', 'Unit Price', 'Status', 'Created Date', 'Updated Date', 'Actions'].map((header) => (
                      <th
                        key={header}
                        className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-400"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {productsQuery.isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-10 text-center text-sm font-bold text-gray-500">
                        Loading products...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-sm font-bold text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    rows.map((product) => {
                      const categoriesList =
                        Array.isArray(product.categories) && product.categories.length > 0
                          ? product.categories
                          : product.category
                            ? [product.category]
                            : [];
                      const typeOptionsList = Array.isArray(product.typeOptions) ? product.typeOptions : [];
                      const typesList = Array.isArray(product.types) ? product.types : [];

                      return (
                        <tr key={product.id} className="hover:bg-gray-50/80">
                          <td className="px-5 py-4 text-sm font-black text-gray-900">{product.name}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-600">{product.code || '-'}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                            {typeOptionsList.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                                {typeOptionsList.map((opt, idx) => (
                                  <span
                                    key={opt.id || idx}
                                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold border ${
                                      opt.isDefault
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-sky-50 text-sky-800 border-sky-100'
                                    }`}
                                    title={opt.isDefault ? `${opt.name} (Default Type)` : opt.name}
                                  >
                                    <span>{opt.name}</span>
                                    <span className="text-[10px] opacity-75">· {formatCurrency(opt.unitPrice)}</span>
                                    {opt.isDefault && (
                                      <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-1 rounded font-black">
                                        DEF
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            ) : typesList.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {typesList.map((typeVal, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block rounded-lg bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-800 border border-sky-100"
                                  >
                                    {typeVal}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                            {categoriesList.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {categoriesList.map((catVal, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-100"
                                  >
                                    {catVal}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm font-black text-gray-900">
                            {typeOptionsList.length > 0 ? (() => {
                              const prices = typeOptionsList.map((t) => Number(t.unitPrice) || 0);
                              const min = Math.min(...prices);
                              const max = Math.max(...prices);
                              return min === max ? (
                                formatCurrency(min)
                              ) : (
                                <div>
                                  <span>{formatCurrency(min)} – {formatCurrency(max)}</span>
                                  <div className="text-[10px] font-semibold text-gray-400">
                                    Base: {formatCurrency(product.unitPrice)}
                                  </div>
                                </div>
                              );
                            })() : (
                              formatCurrency(product.unitPrice)
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                product.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {product.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-500">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-500">
                            {new Date(product.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(product)}
                                className="rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/50 cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleMutation.mutate(product.id)}
                                className={`rounded-xl border p-2 transition cursor-pointer ${
                                  product.status === 'ACTIVE'
                                    ? 'border-gray-200 text-emerald-600 hover:bg-emerald-50'
                                    : 'border-gray-200 text-gray-400 hover:bg-gray-100'
                                }`}
                                title={product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              >
                                <Power className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete product "${product.name}"?`)) {
                                    deleteMutation.mutate(product.id);
                                  }
                                }}
                                className="rounded-xl border border-gray-200 p-2 text-gray-400 transition hover:border-red-200 hover:text-red-600 hover:bg-red-50/50 cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
                <span className="text-xs font-bold text-gray-500">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4">
            <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 shrink-0 bg-white">
                <div>
                  <h2 className="text-xl font-black text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h2>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    Configure product details, categories, and type-based pricing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-6">
                {/* 1. BASIC INFORMATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      1. Basic Information
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-black text-gray-900">Product Name *</span>
                      <input
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        placeholder="e.g. Standard Consultation"
                        className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-emerald-400 transition"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-black text-gray-900">Product Code</span>
                      <input
                        value={form.code}
                        onChange={(event) => setForm({ ...form, code: event.target.value })}
                        placeholder="e.g. PRD-001"
                        className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-emerald-400 transition"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-black text-gray-900">Status</span>
                      <select
                        value={form.status}
                        onChange={(event) => setForm({ ...form, status: event.target.value as ProductStatus })}
                        className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-emerald-400 transition bg-white"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </label>

                    <label className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-gray-900">Base Unit Price *</span>
                        {(form.typeOptions || []).length > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Syncs with Default Type
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={form.unitPrice === 0 ? '0' : (form.unitPrice || '')}
                        onChange={(event) => setForm({ ...form, unitPrice: Math.max(0, Number(event.target.value) || 0) })}
                        placeholder="0.00"
                        readOnly={(form.typeOptions || []).length > 0}
                        className={`h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm font-semibold outline-none transition ${
                          (form.typeOptions || []).length > 0 ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : 'focus:border-emerald-400'
                        }`}
                      />
                    </label>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-sm font-black text-gray-900">Description</span>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      placeholder="Optional product description or scope of work..."
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-400 transition"
                    />
                  </label>
                </div>

                {/* 2. CONFIGURABLE CATEGORIES */}
                <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          2. Configurable Categories
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 mt-1">
                        Add multiple selectable categories for this product (e.g. Software, Consulting, Retainer).
                      </p>
                    </div>
                    <span className="text-xs font-black text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm">
                      {(form.categories || []).length} added
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                      placeholder="Enter category name and press enter or click + Add"
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-900 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={!categoryInput.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  {(form.categories || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(form.categories || []).map((catVal, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 shadow-sm"
                        >
                          <span>{catVal}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(idx)}
                            title="Remove Category"
                            aria-label="Remove Category"
                            className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] font-semibold text-gray-400 italic">
                      No categories added yet. Type a name above and click + Add Category.
                    </p>
                  )}
                </div>

                {/* 3. TYPES & PRICING TABLE */}
                <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          3. Types & Pricing
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 mt-1">
                        Configure distinct types with separate unit prices. Each type can be independently priced and selected on leads.
                      </p>
                    </div>
                    <span className="text-xs font-black text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm">
                      {(form.typeOptions || []).length} configured
                    </span>
                  </div>

                  {(form.typeOptions || []).length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3.5 py-3 font-black text-gray-600 uppercase tracking-wider">Type Name *</th>
                            <th className="px-3.5 py-3 font-black text-gray-600 uppercase tracking-wider w-[140px]">Unit Price *</th>
                            <th className="px-3.5 py-3 font-black text-gray-600 uppercase tracking-wider w-[120px]">Status</th>
                            <th className="px-3.5 py-3 font-black text-gray-600 uppercase tracking-wider w-[90px] text-center">Default</th>
                            <th className="px-3.5 py-3 font-black text-gray-600 uppercase tracking-wider w-[60px] text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {(form.typeOptions || []).map((opt, idx) => (
                            <tr key={opt.id || idx} className="hover:bg-gray-50/80 transition">
                              <td className="px-3 py-2.5">
                                <input
                                  type="text"
                                  value={opt.name}
                                  onChange={(e) => handleUpdateTypeRow(idx, 'name', e.target.value)}
                                  placeholder="e.g. Online, In-Person, VIP"
                                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-xs font-bold text-gray-900 outline-none focus:border-emerald-500 bg-white"
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={opt.unitPrice === 0 ? '0' : (opt.unitPrice || '')}
                                    onChange={(e) => handleUpdateTypeRow(idx, 'unitPrice', e.target.value)}
                                    placeholder="0.00"
                                    className="h-9 w-full rounded-lg border border-gray-200 pl-6 pr-2 text-xs font-black text-gray-900 outline-none focus:border-emerald-500 bg-white"
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <select
                                  value={opt.status || 'ACTIVE'}
                                  onChange={(e) => handleUpdateTypeRow(idx, 'status', e.target.value)}
                                  className="h-9 w-full rounded-lg border border-gray-200 px-2 text-xs font-bold text-gray-700 outline-none focus:border-emerald-500 bg-white"
                                >
                                  <option value="ACTIVE">Active</option>
                                  <option value="INACTIVE">Inactive</option>
                                </select>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <label className="inline-flex cursor-pointer items-center justify-center p-1" title="Mark as default type for this product">
                                  <input
                                    type="radio"
                                    name="defaultProductTypeSelection"
                                    checked={Boolean(opt.isDefault)}
                                    onChange={() => handleSetDefaultType(idx)}
                                    className="h-4 w-4 cursor-pointer accent-emerald-600"
                                  />
                                </label>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTypeRow(idx)}
                                  title="Remove Type"
                                  className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs font-semibold text-gray-500 bg-white/70">
                      No types configured yet. This product will use the single Base Unit Price.
                      Click &ldquo;+ Add Type&rdquo; below to set up type-based pricing.
                    </div>
                  )}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAddTypeRow}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-black transition cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Type</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-5 shrink-0 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 hover:bg-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canSave || saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                  className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductListPage;
