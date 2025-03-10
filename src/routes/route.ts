import { Router, Request, Response } from "express";
import { CategoryController, UserController, ProductController } from "../controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Root route 
router.get('/', (req, res) => {
  res.send({ message: 'Welcome to API' });
});

// Public route: User registration
router.post("/users/auth", async (req, res) => {
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

router.post("/categories/all", async (req, res ) => {
  try {
    await CategoryController.handleCategoryRequest(req, res)
  } catch (error) {
    console.error("Unhandled error in protected user route:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


router.post("/categories", authMiddleware, async (req, res ) => {
  try {
    await CategoryController.handleCategoryRequest(req, res)
  } catch (error) {
    console.error("Unhandled error in protected user route:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


router.post("/products/all", async (req, res ) => {
  try {
    await ProductController.handleProductRequest(req, res)
  } catch (error) {
    console.error("Unhandled error in protected user route:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


router.post("/products", authMiddleware, async (req, res ) => {
  try {
    await ProductController.handleProductRequest(req, res)
  } catch (error) {
    console.error("Unhandled error in protected user route:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
