import { Request, Response } from "express";
import { UserService } from "../services";
import { userIdSchema } from "../validations/userValidation";

export class UserController {
  static async handleUserRequest(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { mode, userId, accessToken, ...data } = req.body; // Extract token from body
      if (
        !["createnew", "update", "delete", "retrieve", "login", "logout"].includes(mode)
      ) {
        return res.status(400).json({
          status: 400,
          message:
            "Invalid mode. Supported modes: 'createnew', 'update', 'delete', 'retrieve', 'login'.",
          data: null,
        });
      }

      // **Login User**
      if (mode === "login") {
        const { email, password } = data;

        if (!email || !password) {
          return res.status(400).json({
            status: 400,
            message: "Email and password are required.",
            data: null,
          });
        }

        try {
          const { accessToken, user } = await UserService.loginUser(
            email,
            password
          );

          return res.status(200).json({
            status: 200,
            message: "Login successful.",
            data: { accessToken, user }, // Ensure user data is included separately
          });
        } catch (error: any) {
          return res.status(401).json({
            status: 401,
            message: error.message,
            data: null,
          });
        }
      }

     // **Logout User**
if (mode === "logout") {
  if (!accessToken) {
    return res.status(401).json({
      status: 401,
      message: "Access token required for logout.",
      data: null,
    });
  }

  try {
    await UserService.logoutUser(accessToken);
    return res.status(200).json({
      status: 200,
      message: "Logout successful.",
      data: null,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 400,
      message: error.message || "Logout failed.",
      data: null,
    });
  }
}

      // **Create New User**
      if (mode === "createnew") {
        try {
          if (!data.role) data.role = "customer"; // Default role

          const result = await UserService.registerUser(
            data.name,
            data.email,
            data.password,
            data.role,
            data.phoneNumber
          );

          return res.status(201).json({
            status: 201,
            message: "User registered successfully.",
            data: result,
          });
        } catch (error: any) {
          return res.status(400).json({
            status: 400,
            message: error.message || "Failed to register user.",
            data: null,
          });
        }
      }

      if (!accessToken) {
        return res
          .status(401)
          .json({ status: 401, message: "Access token required.", data: null });
      }

      // **Retrieve User(s)**
      if (mode === "retrieve") {
        if (userId !== undefined) {
          // Validate `userId` only if it exists
          const parsedUserId = userIdSchema.safeParse({ userId });
          if (!parsedUserId.success) {
            return res.status(400).json({
              status: 400,
              message: "Invalid user ID.",
              data: parsedUserId.error.errors,
            });
          }

          const user = await UserService.getUserById(userId, accessToken);
          return user
            ? res.status(200).json({
                status: 200,
                message: "User retrieved successfully.",
                data: user,
              })
            : res.status(404).json({
                status: 404,
                message: `User with ID ${userId} not found.`,
                data: null,
              });
        }

        const users = await UserService.getAllUsers(accessToken);
        return res.status(200).json({
          status: 200,
          message: "Users retrieved successfully.",
          data: users,
        });
      }

      // **Ensure `userId` is valid for update and delete operations**
      if (userId === undefined) {
        return res.status(400).json({
          status: 400,
          message: "`userId` is required for this operation.",
          data: null,
        });
      }

      const parsedUserId = userIdSchema.safeParse({ userId });
      if (!parsedUserId.success) {
        return res.status(400).json({
          status: 400,
          message: "Invalid user ID.",
          data: parsedUserId.error.errors,
        });
      }

      // **Update User**
  
      if (mode === "update") {
        try {
          const updatedUser = await UserService.updateUser(userId, data.data, accessToken);

      
          return res.status(200).json({
            status: 200,
            message: "User updated successfully.",
            data: updatedUser,
          });
        } catch (error: any) {
          console.error("Update user error:", error);
          return res.status(400).json({
            status: 400,
            message: error.message || "User update failed.",
            data: null,
          });
        }
      }
      

      if (mode === "delete") {
        try {
          const result = await UserService.deleteUser(userId, accessToken);

          return res.status(200).json({
            status: 200,
            message: "User deleted successfully.",
            data: result.user, // Return deleted user info
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
      console.error("Error handling user request:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal Server Error", data: null });
    }
  }
}
