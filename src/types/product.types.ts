export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface Product {
  id: string;
  name: string;
  code?: string | null;
  category?: string | null;
  description?: string | null;
  unitPrice: number;
  status: ProductStatus;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search: string;
  status?: ProductStatus;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListProductsResponse {
  success: boolean;
  message?: string;
  data: Product[];
  pagination: ProductPagination;
}

export interface ProductInput {
  name: string;
  code?: string;
  category?: string;
  description?: string;
  unitPrice: number;
  status: ProductStatus;
}

export interface LeadProductSelection {
  productId: string;
  quantity: number;
}
