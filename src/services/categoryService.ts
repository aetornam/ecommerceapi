import db from "../db/db";
import { categories } from "../db/schema";
import redis from "../config/redisClient";
import { eq, desc } from "drizzle-orm";
import { REDIS_TTL } from "../constant/constant";
import { categorySchema } from "../validations/categorievalidation";
import { JwtPayload } from "../types/type";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constant/constant";

export class CategoryService {
  // **Verify JWT Token**
  static async verifyToken(accessToken: string): Promise<JwtPayload> {
    const isBlacklisted = await redis.get(`blacklist:${accessToken}`);
    if (isBlacklisted) {
      throw new Error("Token is invalid. Please log in again.");
    }

    const decoded = jwt.verify(accessToken, JWT_SECRET) as JwtPayload;
    if (!["admin"].includes(decoded.role)) {
      throw new Error("Unauthorized: Only admins can perform this action.");
    }
    return decoded;
  }

  // **Create New Category**
  static async createCategory(name: string, accessToken: string) {
    await CategoryService.verifyToken(accessToken);

    const parsedData = categorySchema.safeParse({ name });
    if (!parsedData.success) {
      throw new Error("Invalid category data.");
    }

    const [newCategory] = await db
      .insert(categories)
      .values({ name })
      .returning();

    if (!newCategory) throw new Error("Category creation failed.");

    // Cache new category
    await redis.del("all_categories");

    return newCategory;
  }

  // **Retrieve All Categories**
  static async getAllCategories() {
    const cachedCategories = await redis.get("all_categories");
    if (cachedCategories) return JSON.parse(cachedCategories);

    const categoriesList = await db
      .select()
      .from(categories)
      .orderBy(desc(categories.createdAt));

    await redis.set("all_categories", JSON.stringify(categoriesList), "EX", REDIS_TTL);

    return categoriesList;
  }

  // **Retrieve Category By ID**
  static async getCategoryById(categoryId: number) {
    const cachedCategory = await redis.get(`category:${categoryId}`);
    if (cachedCategory) return JSON.parse(cachedCategory);

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!category.length) throw new Error("Category not found.");

    await redis.set(`category:${categoryId}`, JSON.stringify(category[0]), "EX", REDIS_TTL);

    return category[0];
  }

  // **Update Category**
  static async updateCategory(categoryId: number, name: string, accessToken: string) {
    await CategoryService.verifyToken(accessToken);

    const parsedData = categorySchema.safeParse({ name });
    if (!parsedData.success) {
      throw new Error("Invalid category data.");
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({ name })
      .where(eq(categories.id, categoryId))
      .returning();

    if (!updatedCategory) throw new Error("Category update failed.");

    // Invalidate cache
    await redis.del(`category:${categoryId}`);
    await redis.del("all_categories");

    return updatedCategory;
  }

  // **Delete Category**
  static async deleteCategory(categoryId: number, accessToken: string) {
    await CategoryService.verifyToken(accessToken);

    const deletedCategory = await db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning();

    if (!deletedCategory.length) {
      throw new Error("Category not found or already deleted.");
    }

    // Invalidate cache
    await redis.del(`category:${categoryId}`);
    await redis.del("all_categories");

    return deletedCategory[0];
  }
}
