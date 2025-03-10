import { Request, Response } from "express";
import { CategoryService } from "../services";
import { categoryIdSchema, categorySchema } from "../validations/categorievalidation";

export class CategoryController {
  static async handleCategoryRequest(req: Request, res: Response): Promise<Response> {
    try {
      const { mode, categoryId, accessToken, ...data } = req.body; // Extract token from body

      if (!["createnew", "update", "delete", "retrieve"].includes(mode)) {
        return res.status(400).json({
          status: 400,
          message: "Invalid mode. Supported modes: 'createnew', 'update', 'delete', 'retrieve'.",
          data: null,
        });
      }

      // **Retrieve All Categories (No Access Token Required)**
      if (mode === "retrieve" && categoryId === undefined) {
        const categories = await CategoryService.getAllCategories();
        return res.status(200).json({
          status: 200,
          message: "Categories retrieved successfully.",
          data: categories,
        });
      }

      // **Retrieve Single Category by ID (No Access Token Required)**
      if (mode === "retrieve" && categoryId !== undefined) {
        const parsedCategoryId = categoryIdSchema.safeParse({ categoryId });
        if (!parsedCategoryId.success) {
          return res.status(400).json({
            status: 400,
            message: "Invalid category ID.",
            data: parsedCategoryId.error.errors,
          });
        }

        const category = await CategoryService.getCategoryById(categoryId);
        return category
          ? res.status(200).json({
              status: 200,
              message: "Category retrieved successfully.",
              data: category,
            })
          : res.status(404).json({
              status: 404,
              message: `Category with ID ${categoryId} not found.`,
              data: null,
            });
      }

      // **Ensure `accessToken` is required for create, update, and delete**
      if (!accessToken) {
        return res.status(401).json({
          status: 401,
          message: "Access token required for this operation.",
          data: null,
        });
      }

      // **Create New Category**
      if (mode === "createnew") {
        const parsedData = categorySchema.safeParse(data);
        if (!parsedData.success) {
          return res.status(400).json({
            status: 400,
            message: "Invalid category data.",
            data: parsedData.error.errors,
          });
        }

        try {
          const newCategory = await CategoryService.createCategory(parsedData.data.name, accessToken);

          return res.status(201).json({
            status: 201,
            message: "Category created successfully.",
            data: newCategory,
          });
        } catch (error: any) {
          return res.status(400).json({
            status: 400,
            message: error.message || "Category creation failed.",
            data: null,
          });
        }
      }

      // **Ensure `categoryId` is valid for update and delete operations**
      if (categoryId === undefined) {
        return res.status(400).json({
          status: 400,
          message: "`categoryId` is required for this operation.",
          data: null,
        });
      }

      const parsedCategoryId = categoryIdSchema.safeParse({ categoryId });
      if (!parsedCategoryId.success) {
        return res.status(400).json({
          status: 400,
          message: "Invalid category ID.",
          data: parsedCategoryId.error.errors,
        });
      }

      // **Update Category**
      if (mode === "update") {
        const parsedData = categorySchema.safeParse(data);
        if (!parsedData.success) {
          return res.status(400).json({
            status: 400,
            message: "Invalid category update data.",
            data: parsedData.error.errors,
          });
        }

        try {
          const updatedCategory = await CategoryService.updateCategory(categoryId, parsedData.data.name, accessToken);

          return res.status(200).json({
            status: 200,
            message: "Category updated successfully.",
            data: updatedCategory,
          });
        } catch (error: any) {
          return res.status(400).json({
            status: 400,
            message: error.message || "Category update failed.",
            data: null,
          });
        }
      }

      // **Delete Category**
      if (mode === "delete") {
        try {
          const deletedCategory = await CategoryService.deleteCategory(categoryId, accessToken);

          return res.status(200).json({
            status: 200,
            message: "Category deleted successfully.",
            data: deletedCategory,
          });
        } catch (error: any) {
          return res.status(400).json({
            status: 400,
            message: error.message,
            data: null,
          });
        }
      }

      return res.status(400).json({
        status: 400,
        message: "Unexpected error occurred.",
        data: null,
      });
    } catch (error) {
      console.error("Error handling category request:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        data: null,
      });
    }
  }
}
