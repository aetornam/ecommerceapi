import { Router } from "express";
import { UserController } from "../controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Public route: User registration
router.post("/users", async (req, res) => {
  try {
    await UserController.handleUserRequest(req, res);
  } catch (error) {
    console.error("Unhandled error in user route:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 🔒 Protected routes: Require authentication
router.post("/users/protected", authMiddleware, async (req, res) => {
  try {
    await UserController.handleUserRequest(req, res);
  } catch (error) {
    console.error("Unhandled error in protected user route:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
