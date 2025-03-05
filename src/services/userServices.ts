import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm/sql";
// Constants
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const SALT_ROUNDS = 10;

// Define Role & JWT Payload Types
type UserRole = "customer" | "admin" | "seller";

interface JwtPayload {
  userId: number;
  role: UserRole;
}

export class UserService {
  // **Generate JWT Token**
  static generateToken(userId: number, role: UserRole): string {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
  }

  // **Verify JWT Token**
  static verifyToken(accessToken: string): JwtPayload {
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
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length) throw new Error("Email is already in use.");

    const hashedPassword = await UserService.hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, passwordHash: hashedPassword, role, phoneNumber })
      .returning();

    if (!newUser) throw new Error("User registration failed.");

    const { passwordHash, ...userData } = newUser; // Exclude password from response
    const accessToken = UserService.generateToken(
      userData.id,
      userData.role as UserRole
    ); // Ensure correct type

    return { accessToken, user: userData };
  }

  // **Login User**
  static async loginUser(email: string, password: string) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) throw new Error("Invalid email or password.");

    const { passwordHash, id, role, ...userData } = user[0];

    const isPasswordValid = await UserService.comparePassword(
      password,
      passwordHash
    );
    if (!isPasswordValid) throw new Error("Invalid email or password.");

    const accessToken = UserService.generateToken(id, role as UserRole);

    return { accessToken, user: { id, role, ...userData } };
  }

  // **Fetch All Users**
  static async getAllUsers(accessToken: string) {
    const decoded = UserService.verifyToken(accessToken);
    if (decoded.role !== "admin") {
      throw new Error("Unauthorized: Only admins can fetch all users.");
    }

    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phoneNumber: users.phoneNumber,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt)); // Use `desc()` function properly
  }

  // **Fetch User by ID**
  static async getUserById(userId: number, accessToken: string) {
    const decoded = UserService.verifyToken(accessToken);

    if (decoded.userId !== userId && decoded.role !== "admin") {
      throw new Error(
        "Unauthorized: You can only view your own profile unless you're an admin."
      );
    }

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

    return user[0];
  }

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
    const decoded = UserService.verifyToken(accessToken);
  
    if (decoded.userId !== userId && decoded.role !== "admin") {
      throw new Error("Unauthorized: You can only update your own profile unless you're an admin.");
    }
  
    if (updateData.role && decoded.role !== "admin") {
      throw new Error("Only admins can update user roles.");
    }
  
    const dbUpdateData: Record<string, any> = {};
    console.log(dbUpdateData)
    if (updateData.name) dbUpdateData.name = updateData.name;
    if (updateData.email) dbUpdateData.email = updateData.email;
    if (updateData.role) dbUpdateData.role = updateData.role;
    if (updateData.phoneNumber) dbUpdateData.phoneNumber = updateData.phoneNumber;
  
    // **Handle Password Update Separately**
    if (updateData.password) {
      const hashedPassword = await UserService.hashPassword(updateData.password);
      dbUpdateData.passwordHash = hashedPassword; // Store hashed password
    }
  
    // **Check if there is at least one valid field to update**
    if (Object.keys(dbUpdateData).length === 0) {
      throw new Error("No valid fields to update.");
    }
  
    // **Update Database**
    const [updatedUser] = await db
      .update(users)
      .set(dbUpdateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phoneNumber: users.phoneNumber,
        createdAt: users.createdAt,
      });
  
    if (!updatedUser) {
      throw new Error("User update failed.");
    }
  
    return updatedUser;
  }
  

  // **Delete User**
  static async deleteUser(userId: number, accessToken: string) {
    const decoded = UserService.verifyToken(accessToken);

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

    return { user: deletedUser[0] }; // Return deleted user details
  }
}
