export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface ProductTypeOption {
  id?: string;
  name: string;
  unitPrice: number | string;
  status?: ProductStatus;
  isDefault?: boolean;
  categories?: string[];
}

export interface Product {
  id: string;
  name: string;
  code?: string | null;
  category?: string | null;
  categories?: string[];
  types?: string[];
  typeOptions?: ProductTypeOption[];
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
  categories?: string[];
  types?: string[];
  typeOptions?: ProductTypeOption[];
  description?: string;
  unitPrice: number | string;
  status: ProductStatus;
}

export interface LeadProductSelection {
  productId: string;
  quantity: number;
  typeId?: string;
  type?: string;
  category?: string;
  unitPrice?: number;
}
