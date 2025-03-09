import { UserRole } from "../types"; // Import UserRole type if you have it

declare module "express" {
  export interface Request {
    user?: {
      id: number;
      role: UserRole;
    };
  }
}
