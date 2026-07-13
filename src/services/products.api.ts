import api from './api';
import type { ListProductsResponse, ProductInput, ProductFilters } from '../types/product.types';

export const getProducts = async (params?: ProductFilters & { page?: number; limit?: number }): Promise<ListProductsResponse> => {
  const response = await api.get('/master/products', { params });
  return response.data;
};

export const getActiveProducts = async () => {
  const response = await api.get('/master/products/active');
  return response.data;
};

export const createProduct = async (data: ProductInput) => {
  const response = await api.post('/master/products', data);
  return response.data.data;
};

export const updateProduct = async (id: string, data: Partial<ProductInput>) => {
  const response = await api.put(`/master/products/${id}`, data);
  return response.data.data;
};

export const toggleProductStatus = async (id: string) => {
  const response = await api.patch(`/master/products/${id}/status`);
  return response.data.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/master/products/${id}`);
  return response.data;
};
