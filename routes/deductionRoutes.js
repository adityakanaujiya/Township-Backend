import express from "express";
import {
  generateDeduction,
  getDeductions,
} from "../controllers/deductionController.js";
import { protect, authorizeRoles } from "../middleware/auth.js";
import Deduction from "../models/Deduction.js";

const router = express.Router();

// Generate monthly deduction
router.post("/generate", protect, generateDeduction);

// Get all deductions
router.get("/", protect, getDeductions);

// Get deduction history for the logged-in user
router.get("/my-history", protect, authorizeRoles("user"), async (req, res) => {
  const history = await Deduction.find({
    employeeId: req.user.id,
  });

  res.json(history);
});

export default router;
