import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm/sql";
import redis from "../config/redisClient";
import {UserRole, JwtPayload} from "../types/type"
import {JWT_SECRET, SALT_ROUNDS, REDIS_TTL} from "../constant/constant";


export class UserService {
  // **Generate JWT Token**
  static generateToken(userId: number, role: UserRole): string {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
  }

  // **Verify JWT Token**
  static async verifyToken(accessToken: string): Promise<JwtPayload> {
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${accessToken}`);
    if (isBlacklisted) {
      throw new Error("Token is invalid. Please log in again.");
    }

    const decoded = jwt.verify(accessToken, JWT_SECRET) as JwtPayload;
    if (!["customer", "admin", "seller"].includes(decoded.role)) {
      throw new Error("Invalid role in token.");
    }
    return decoded;
  }

  // **Hash Password**
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  // **Compare Password**
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // **Register New User**
  static async registerUser(
    name: string,
    email: string,
    password: string,
    role: UserRole = "customer",
    phoneNumber?: string
  ) {
    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email)) 
        .limit(1);
  
        if (existingUser.length > 0) {  
          throw new Error("Email is already in use. Please try a different email.");
        }
  
      const hashedPassword = await UserService.hashPassword(password);
  
      const [newUser] = await db
        .insert(users)
        .values({ name, email, passwordHash: hashedPassword, role, phoneNumber })
        .returning();
  
      if (!newUser) throw new Error("User registration failed.");
   
      const { passwordHash, ...userData } = newUser;
      const accessToken = UserService.generateToken(userData.id, userData.role as UserRole);
  
      // Cache user in Redis
      await redis.set(
        `user:${userData.id}`,
        JSON.stringify(userData),
        "EX",
        REDIS_TTL
      );
  
      return { accessToken, user: userData };
    } catch (error: any) {
      throw new Error(error.message || "An unexpected error occurred during registration.");
    }
  }
  

  // **Login User**
  static async loginUser(email: string, password: string) {
    const cachedUser = await redis.get(`user_email:${email}`);

    let user;
    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!dbUser.length) throw new Error("Invalid email or password.");
      user = dbUser[0];

      // Cache user by email
      await redis.set(
        `user_email:${email}`,
        JSON.stringify(user),
        "EX",
        REDIS_TTL
      );
    }

    const { passwordHash, id, role, ...userData } = user;

    const isPasswordValid = await UserService.comparePassword(
      password,
      passwordHash
    );
    if (!isPasswordValid) throw new Error("Invalid email or password.");

    const accessToken = UserService.generateToken(id, role as UserRole);

    return { accessToken, user: { id, role, ...userData } };
  }

  // **Logout User (Blacklist Token)**
  static async logoutUser(accessToken: string) {
    const decoded = UserService.verifyToken(accessToken);

    // Store the token in Redis with its expiration time
    await redis.set(`blacklist:${accessToken}`, "1", "EX", 60 * 60 * 24 * 7); // Expire in 7 days

    return { message: "User logged out successfully." };
  }

  // **Fetch All Users**
  static async getAllUsers(accessToken: string) {
    const decoded = UserService.verifyToken(accessToken);
    if ((await decoded).role !== "admin")
      throw new Error("Unauthorized: Only admins can fetch all users.");

    const cachedUsers = await redis.get("all_users");
    if (cachedUsers) return JSON.parse(cachedUsers);

    const usersList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phoneNumber: users.phoneNumber,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    // Cache users
    await redis.set("all_users", JSON.stringify(usersList), "EX", REDIS_TTL);

    return usersList;
  }

  // **Fetch User by ID**
  static async getUserById(userId: number, accessToken: string) {
    const decoded = await UserService.verifyToken(accessToken);
    if (decoded.userId !== userId && decoded.role !== "admin") {
      throw new Error(
        "Unauthorized: You can only view your own profile unless you're an admin."
      );
    }

    const cachedUser = await redis.get(`user:${userId}`);
    if (cachedUser) return JSON.parse(cachedUser);

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phoneNumber: users.phoneNumber,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) throw new Error("User not found.");

    await redis.set(`user:${userId}`, JSON.stringify(user[0]), "EX", REDIS_TTL);

    return user[0];
  }

  // **Update User**
  // **Update User**
  static async updateUser(
    userId: number,
    updateData: Partial<{
      name: string;
      email: string;
      password: string;
      role: UserRole;
      phoneNumber: string;
    }>,
    accessToken: string
  ) {
    const decoded = await UserService.verifyToken(accessToken);
    if (decoded.userId !== userId && decoded.role !== "admin") {
      throw new Error(
        "Unauthorized: You can only update your own profile unless you're an admin."
      );
    }

    if (updateData.role && decoded.role !== "admin")
      throw new Error("Only admins can update user roles.");

    const dbUpdateData: Record<string, any> = {};
    if (updateData.name) dbUpdateData.name = updateData.name;
    if (updateData.email) dbUpdateData.email = updateData.email;
    if (updateData.role) dbUpdateData.role = updateData.role;
    if (updateData.phoneNumber)
      dbUpdateData.phoneNumber = updateData.phoneNumber;

    if (updateData.password) {
      const hashedPassword = await UserService.hashPassword(
        updateData.password
      );
      dbUpdateData.passwordHash = hashedPassword;
    }

    if (Object.keys(dbUpdateData).length === 0)
      throw new Error("No valid fields to update.");

    const [updatedUser] = await db
      .update(users)
      .set(dbUpdateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) throw new Error("User update failed.");

    // **Invalidate Cache**
    await redis.del(`user:${userId}`);
    await redis.del("all_users"); // Also invalidate the all users list

    return updatedUser;
  }

  // **Delete User**
  static async deleteUser(userId: number, accessToken: string) {
    const decoded = await UserService.verifyToken(accessToken);
    if (decoded.role !== "admin") {
      throw new Error("Only admins can delete users.");
    }

    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id, name: users.name, email: users.email });

    if (!deletedUser.length) {
      throw new Error("User not found or already deleted.");
    }

    // **Invalidate Cache**
    await redis.del(`user:${userId}`);
    await redis.del("all_users");

    return { user: deletedUser[0] };
  }
}
