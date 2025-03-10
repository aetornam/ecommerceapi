import db from "../db/db";
import { products } from "../db/schema";
import redis from "../config/redisClient";
import { eq, desc } from "drizzle-orm";
import { REDIS_TTL } from "../constant/constant";
import { productSchema } from "../validations/productValidation";
import { JwtPayload } from "../types/type";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constant/constant";

export class ProductService {
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

  // **Create Product**
  static async createProduct(data: any, accessToken: string) {
    await ProductService.verifyToken(accessToken);

    const parsedData = productSchema.safeParse(data);
    if (!parsedData.success) {
      throw new Error("Invalid product data.");
    }

    // Convert price to string for Drizzle ORM compatibility
    const formattedData = {
      ...parsedData.data,
      price: parsedData.data.price.toString(),
    };

    const [newProduct] = await db.insert(products).values(formattedData).returning();

    if (!newProduct) throw new Error("Product creation failed.");

    // Invalidate cache
    await redis.del("all_products");

    return newProduct;
  }

  // **Retrieve All Products**
  static async getAllProducts() {
    const cachedProducts = await redis.get("all_products");
    if (cachedProducts) return JSON.parse(cachedProducts);

    const productList = await db.select().from(products).orderBy(desc(products.createdAt));

    await redis.set("all_products", JSON.stringify(productList), "EX", REDIS_TTL);

    return productList;
  }

  // **Retrieve Product By ID**
  static async getProductById(productId: number) {
    const cachedProduct = await redis.get(`product:${productId}`);
    if (cachedProduct) return JSON.parse(cachedProduct);

    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);

    if (!product.length) throw new Error("Product not found.");

    await redis.set(`product:${productId}`, JSON.stringify(product[0]), "EX", REDIS_TTL);

    return product[0];
  }

  // **Update Product**
  static async updateProduct(productId: number, data: any, accessToken: string) {
    await ProductService.verifyToken(accessToken);

    const parsedData = productSchema.safeParse(data);
    if (!parsedData.success) {
      throw new Error("Invalid product data.");
    }

    // Convert price to string before updating
    const formattedData = {
      ...parsedData.data,
      price: parsedData.data.price.toString(),
    };

    const [updatedProduct] = await db.update(products).set(formattedData).where(eq(products.id, productId)).returning();

    if (!updatedProduct) throw new Error("Product update failed.");

    // Invalidate cache
    await redis.del(`product:${productId}`);
    await redis.del("all_products");

    return updatedProduct;
  }

  // **Delete Product**
  static async deleteProduct(productId: number, accessToken: string) {
    await ProductService.verifyToken(accessToken);

    const deletedProduct = await db.delete(products).where(eq(products.id, productId)).returning();

    if (!deletedProduct.length) {
      throw new Error("Product not found or already deleted.");
    }

    // Invalidate cache
    await redis.del(`product:${productId}`);
    await redis.del("all_products");

    return deletedProduct[0];
  }
}
