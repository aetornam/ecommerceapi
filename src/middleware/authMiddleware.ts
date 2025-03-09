import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

type UserRole = "customer" | "admin" | "seller";

interface DecodedToken {
  id: number;
  role: UserRole;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedToken;
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.body.accessToken; // Extract token from request body

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = decoded;
    next();
  } catch (error) {
    res
      .status(403)
      .json({ success: false, message: "Forbidden: Invalid token" });
  }
};
