import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  searchEmployees,
  deleteEmployee,
  toggleActiveStatus,
} from "../controllers/employeeController.js";

import { protect, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// 🔍 Search (Admin + Supervisor)
router.get(
  "/search",
  protect,
  authorizeRoles("admin", "supervisor"),
  searchEmployees,
);

// 👁 View All Employees (Admin + Supervisor)
router.get("/", protect, authorizeRoles("admin", "supervisor"), getEmployees);

// 👁 View Single Employee (Admin + Supervisor)
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "supervisor", "user"),
  getEmployeeById,
);
// ➕ Create Employee (Admin only)
router.post("/", protect, authorizeRoles("admin"), createEmployee);

// ✏ Update Employee (Admin only)
router.put("/:id", protect, authorizeRoles("admin"), updateEmployee);

// 🗑️ Delete Employee (Admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteEmployee);

// 🔄 Toggle Active Status (Admin only)
router.patch(
  "/:id/active",
  protect,
  authorizeRoles("admin"),
  toggleActiveStatus,
);
export default router;
