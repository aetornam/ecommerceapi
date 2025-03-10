import { z } from "zod";

export const categorySchema = z.object({
  id: z.number().int().positive().optional(), // Auto-incremented primary key
  name: z.string().min(1, "Category name is required").max(100, "Max 100 characters"),
  createdAt: z.date().optional(), // Will be set automatically by the database
});

// Schema for validating category ID
export const categoryIdSchema = z.object({
  categoryId: z.number().int().positive(),
});
