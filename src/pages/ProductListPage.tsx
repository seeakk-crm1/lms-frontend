import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Package, Plus, Power, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { createProduct, deleteProduct, getProducts, toggleProductStatus, updateProduct } from '../services/products.api';
import type { Product, ProductInput, ProductStatus } from '../types/product.types';

import { formatCurrency } from '../utils/currency';

const emptyForm: ProductInput = {
  name: '',
  code: '',
  category: '',
  categories: [],
  types: [],
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
  const [typeInput, setTypeInput] = useState('');
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

      let currentTypes = [...(form.types || [])];
      const pendingType = typeInput.trim();
      if (pendingType && !currentTypes.some((t) => t.toLowerCase() === pendingType.toLowerCase())) {
        currentTypes.push(pendingType);
      }

      const sanitizedCategories = Array.from(
        new Set(currentCategories.map((c) => c.trim()).filter(Boolean)),
      );
      const sanitizedTypes = Array.from(
        new Set(currentTypes.map((t) => t.trim()).filter(Boolean)),
      );
      const payload: ProductInput = {
        ...form,
        unitPrice: Number(form.unitPrice),
        code: form.code?.trim() || undefined,
        category: sanitizedCategories[0] || form.category?.trim() || undefined,
        categories: sanitizedCategories,
        types: sanitizedTypes,
        description: form.description?.trim() || undefined,
      };
      return editing ? updateProduct(editing.id, payload) : createProduct(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Product updated' : 'Product created');
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setTypeInput('');
      setCategoryInput('');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not save product'),
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

  const canSave = useMemo(
    () => form.name.trim().length > 0 && Number(form.unitPrice) > 0,
    [form.name, form.unitPrice],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setTypeInput('');
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
    const existingTypes = parseStringArray(product.types);

    setForm({
      name: product.name,
      code: product.code || '',
      category: product.category || existingCategories[0] || '',
      categories: existingCategories,
      types: existingTypes,
      description: product.description || '',
      unitPrice: product.unitPrice,
      status: product.status,
    });
    setTypeInput('');
    setCategoryInput('');
    setFormOpen(true);
  };

  const handleAddType = () => {
    const trimmed = typeInput.trim();
    if (!trimmed) return;
    const currentTypes = form.types || [];
    if (currentTypes.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Type "${trimmed}" already added.`);
      return;
    }
    setForm((prev) => ({
      ...prev,
      types: [...(prev.types || []), trimmed],
    }));
    setTypeInput('');
  };

  const handleRemoveType = (index: number) => {
    setForm((prev) => ({
      ...prev,
      types: (prev.types || []).filter((_, i) => i !== index),
    }));
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
                Manage selectable products, configurable types, categories, and price snapshots for lead totals.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-600"
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
                    {['Product Name', 'Product Code', 'Type', 'Category', 'Unit Price', 'Status', 'Created Date', 'Updated Date', 'Actions'].map((header) => (
                      <th key={header} className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
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
                      const typesList = Array.isArray(product.types) ? product.types : [];

                      return (
                        <tr key={product.id} className="hover:bg-gray-50/80">
                          <td className="px-5 py-4 text-sm font-black text-gray-900">{product.name}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-600">{product.code || '-'}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                            {typesList.length > 0 ? (
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
                            {formatCurrency(product.unitPrice)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${product.status === 'ACTIVE'
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
                                className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:border-emerald-200 hover:text-emerald-600"
                                title="Edit product"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleMutation.mutate(product.id)}
                                className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:border-amber-200 hover:text-amber-600"
                                title={product.status === 'ACTIVE' ? 'Deactivate product' : 'Activate product'}
                              >
                                <Power className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMutation.mutate(product.id)}
                                className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:border-rose-200 hover:text-rose-600"
                                title="Delete product"
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
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-sm font-bold text-gray-500">
              <span>Showing {rows.length} of {pagination?.total || 0}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="rounded-xl border border-gray-200 px-3 py-2 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="px-2">Page {page}</span>
                <button
                  type="button"
                  disabled={!pagination || page >= pagination.totalPages}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-xl border border-gray-200 px-3 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4">
            <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 shrink-0">
                <div>
                  <h2 className="text-xl font-black text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h2>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">Configure product details, types, and categories.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-5">
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
                    <span className="text-sm font-black text-gray-900">Unit Price *</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.unitPrice || ''}
                      onChange={(event) => setForm({ ...form, unitPrice: Number(event.target.value) })}
                      placeholder="0.00"
                      className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-emerald-400 transition"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-black text-gray-900">Status</span>
                    <select
                      value={form.status}
                      onChange={(event) => setForm({ ...form, status: event.target.value as ProductStatus })}
                      className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-emerald-400 transition"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </label>
                </div>

                {/* Configurable Type Section */}
                <div className="space-y-2.5 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-gray-900">Configurable Types</span>
                      <p className="text-xs font-semibold text-gray-500">
                        Add multiple selectable types for this product (e.g. Online, In-Person, VIP).
                      </p>
                    </div>
                    <span className="text-xs font-black text-gray-400 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                      {(form.types || []).length} added
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={typeInput}
                      onChange={(e) => setTypeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddType();
                        }
                      }}
                      placeholder="Enter type name and press enter or click + Add"
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-900 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddType}
                      disabled={!typeInput.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {(form.types || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(form.types || []).map((typeVal, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-900 shadow-sm"
                        >
                          <span>{typeVal}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveType(idx)}
                            title="Remove Type"
                            aria-label="Remove Type"
                            className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] font-semibold text-gray-400 italic">
                      No types added yet. Type a name above and click + Add.
                    </p>
                  )}
                </div>

                {/* Configurable Category Section */}
                <div className="space-y-2.5 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-gray-900">Configurable Categories</span>
                      <p className="text-xs font-semibold text-gray-500">
                        Add multiple selectable categories for this product (e.g. Software, Consulting, Retainer).
                      </p>
                    </div>
                    <span className="text-xs font-black text-gray-400 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
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
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-900 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={!categoryInput.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {(form.categories || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(form.categories || []).map((catVal, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-900 shadow-sm"
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
                      No categories added yet. Type a name above and click + Add.
                    </p>
                  )}
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-black text-gray-900">Description</span>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder="Optional product description or scope of work..."
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-400 transition"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-5 shrink-0 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 hover:bg-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canSave || saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                  className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
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
