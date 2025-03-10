import { Request, Response } from "express";
import { ProductService } from "../services";
import { productIdSchema, productSchema } from "../validations/productValidation";

export class ProductController {
  static async handleProductRequest(req: Request, res: Response): Promise<Response> {
    try {
      const { mode, productId, accessToken, ...data } = req.body;

      if (!["createnew", "update", "delete", "retrieve"].includes(mode)) {
        return res.status(400).json({
          status: 400,
          message: "Invalid mode. Supported modes: 'createnew', 'update', 'delete', 'retrieve'.",
          data: null,
        });
      }


       // **Retrieve Product(s)**
       if (mode === "retrieve") {
        if (productId !== undefined) {
          const parsedProductId = productIdSchema.safeParse({ productId });
          if (!parsedProductId.success) {
            return res.status(400).json({
              status: 400,
              message: "Invalid product ID.",
              data: parsedProductId.error.errors,
            });
          }

          const product = await ProductService.getProductById(productId);
          return res.status(200).json({
            status: 200,
            message: "Product retrieved successfully.",
            data: product,
          });
        }

        const products = await ProductService.getAllProducts();
        return res.status(200).json({
          status: 200,
          message: "Products retrieved successfully.",
          data: products,
        });
      }

      if (!accessToken) {
        return res.status(401).json({
          status: 401,
          message: "Access token required.",
          data: null,
        });
      }

      // **Create New Product**
      if (mode === "createnew") {
        const parsedData = productSchema.safeParse(data);
        if (!parsedData.success) {
          return res.status(400).json({
            status: 400,
            message: "Invalid product data.",
            data: parsedData.error.errors,
          });
        }

        try {
          const newProduct = await ProductService.createProduct(parsedData.data, accessToken);
          return res.status(201).json({
            status: 201,
            message: "Product created successfully.",
            data: newProduct,
          });
        } catch (error: any) {
          return res.status(400).json({
            status: 400,
            message: error.message || "Product creation failed.",
            data: null,
          });
        }
      }

     

      // **Ensure `productId` is valid for update and delete operations**
      if (productId === undefined) {
        return res.status(400).json({
          status: 400,
          message: "`productId` is required for this operation.",
          data: null,
        });
      }

      const parsedProductId = productIdSchema.safeParse({ productId });
      if (!parsedProductId.success) {
        return res.status(400).json({
          status: 400,
          message: "Invalid product ID.",
          data: parsedProductId.error.errors,
        });
      }

      // **Update Product**
      if (mode === "update") {
        const parsedData = productSchema.safeParse(data);
        if (!parsedData.success) {
          return res.status(400).json({
            status: 400,
            message: "Invalid product update data.",
            data: parsedData.error.errors,
          });
        }

        const updatedProduct = await ProductService.updateProduct(productId, parsedData.data, accessToken);
        return res.status(200).json({
          status: 200,
          message: "Product updated successfully.",
          data: updatedProduct,
        });
      }

      // **Delete Product**
      if (mode === "delete") {
        const deletedProduct = await ProductService.deleteProduct(productId, accessToken);
        return res.status(200).json({
          status: 200,
          message: "Product deleted successfully.",
          data: deletedProduct,
        });
      }

      return res.status(400).json({ status: 400, message: "Unexpected error occurred.", data: null });
    } catch (error) {
      console.error("Error handling product request:", error);
      return res.status(500).json({ status: 500, message: "Internal Server Error", data: null });
    }
  }
}
