export type ProductStatus = "Draft" | "Active" | "Inactive";

export type Product = {
  id: string;
  name: string;
  supplier: string | null;
  origin: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  isDeleted: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  category: string | null;
  sku: string | null;
  image: string | null;
  imageUrl: string | null;
};

export type ProductFormValues = {
  name: string;
  supplier: string;
  origin: string;
  price: number;
  stock: number;
  status: ProductStatus;
};

export type CreateProductRequest = ProductFormValues;
export type UpdateProductRequest = ProductFormValues;