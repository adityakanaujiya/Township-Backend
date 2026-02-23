import express from "express";
import {
  addElectricity,
  getElectricity,
} from "../controllers/electricityController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Add monthly electricity reading
router.post("/", protect, addElectricity);

// Get all electricity records
router.get("/", protect, getElectricity);

export default router;
