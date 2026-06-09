export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; publicId: string };
  parent?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt: string;
}
