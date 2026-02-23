import express from "express";
import { register, login, getMe } from "../controllers/authController.js";

import {
  createUserWithDetails,
  updateUserRole,
} from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Register user
router.post("/register", register);

// Login user
router.post("/login", login);

// Get logged-in user
router.get("/me", protect, getMe);

// Admin creates full user + employee
router.post(
  "/create-user",
  protect,
  authorizeRoles("admin"),
  createUserWithDetails,
);

// Admin updates user role
router.patch(
  "/update-role/:id",
  protect,
  authorizeRoles("admin"),
  updateUserRole,
);
export default router;
