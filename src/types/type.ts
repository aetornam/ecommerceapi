// Define Role & JWT Payload Types
export type UserRole = "customer" | "admin" | "seller";

export interface JwtPayload {
    userId: number;
    role: UserRole;
  }