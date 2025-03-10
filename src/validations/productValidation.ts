import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Max 255 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  sku: z.string().min(1, "Product sku is required").max(255, "Max 255 characters"),
  image: z.string().url("Invalid image URL").optional(), // Ensures a valid URL if provided
  categoryId: z.number().int().positive("Category ID must be a positive integer"),
});

export const productIdSchema = z.object({
  productId: z.number().int().positive("Invalid product ID"),
});
