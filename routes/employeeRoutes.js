import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getMyEmployee,
  updateEmployee,
  searchEmployees,
  deleteEmployee,
  toggleActiveStatus,
} from "../controllers/employeeController.js";

import { protect, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

/* ================================
   IMPORTANT: Order Matters Here
   ================================ */

// 🔍 Search Employees (Admin + Supervisor)
router.get(
  "/search",
  protect,
  authorizeRoles("admin", "supervisor"),
  searchEmployees,
);

// 👤 Get Logged-in User's Employee Profile (User only)
router.get("/me", protect, authorizeRoles("user"), getMyEmployee);

// 👥 Get All Employees (Admin + Supervisor)
router.get("/", protect, authorizeRoles("admin", "supervisor"), getEmployees);

// 👁 Get Single Employee by ID (Admin + Supervisor)
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "supervisor"),
  getEmployeeById,
);

// ➕ Create Employee (Admin only)
router.post("/", protect, authorizeRoles("admin"), createEmployee);

// ✏ Update Employee (Admin only)
router.put("/:id", protect, authorizeRoles("admin"), updateEmployee);

// ❌ Delete Employee (Admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteEmployee);

// 🔄 Toggle Active Status (Admin only)
router.patch(
  "/:id/active",
  protect,
  authorizeRoles("admin"),
  toggleActiveStatus,
);

export default router;
