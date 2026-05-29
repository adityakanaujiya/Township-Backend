import express from "express";
import {
  generateDeduction,
  getDeductions,
  getMyDeductions,
} from "../controllers/deductionController.js";
import { protect, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Generate monthly deduction (Admin only)
router.post("/generate", protect, authorizeRoles("admin"), generateDeduction);

// Get all deductions (Admin + Supervisor)
router.get("/", protect, authorizeRoles("admin", "supervisor"), getDeductions);

// Get logged-in user's deductions (User only)
router.get("/my", protect, authorizeRoles("user"), getMyDeductions);

export default router;
