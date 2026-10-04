import api from './axios';
import type { Category } from '@/types/category';
import type { ApiResponse } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  if (!BASE_URL) return { success: false, data: [] };

  const res = await fetch(`${BASE_URL}/categories`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`fetchCategories failed: ${res.status}`);
  return res.json();
}

export async function fetchCategory(slug: string): Promise<ApiResponse<Category>> {
  if (!BASE_URL) return { success: false, data: null as unknown as Category };

  const res = await fetch(`${BASE_URL}/categories/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`fetchCategory failed: ${res.status}`);
  return res.json();
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  parentId?: string | null;
  sortOrder?: number;
}

function buildCategoryFormData(payload: Partial<CreateCategoryPayload>, imageFile?: File): FormData {
  const formData = new FormData();
  (Object.entries(payload) as [string, unknown][]).forEach(([key, value]) => {
    if (value != null) formData.append(key, String(value));
  });
  if (imageFile) formData.append('image', imageFile);
  return formData;
}

export async function createCategory(payload: CreateCategoryPayload, imageFile?: File): Promise<Category> {
  if (imageFile) {
    const { data } = await api.post('/categories', buildCategoryFormData(payload, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data as Category;
  }
  const { data } = await api.post('/categories', payload);
  return data.data as Category;
}

export async function updateCategory(id: string, payload: Partial<CreateCategoryPayload>, imageFile?: File): Promise<Category> {
  if (imageFile) {
    const { data } = await api.put(`/categories/${id}`, buildCategoryFormData(payload, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data as Category;
  }
  const { data } = await api.put(`/categories/${id}`, payload);
  return data.data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
