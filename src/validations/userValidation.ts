import { z } from "zod";

// Validation for User Registration
export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "admin", "seller"]).default("customer"), // Default role is customer
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
});

// Validation for User Login
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Validation for User Update
export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["customer", "admin", "seller"]).optional(), // Allow updating role
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
});

// Validation for User ID
export const userIdSchema = z.object({
  userId: z.number().int().positive("Invalid user ID"),
});
