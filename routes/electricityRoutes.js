import express from "express";
import {
  addElectricity,
  getElectricity,
  getMyElectricity,
} from "../controllers/electricityController.js";
import { protect, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// POST /api/electricity
router.post(
  "/",
  protect,
  authorizeRoles("admin", "supervisor"),
  addElectricity,
);

// GET /api/electricity
router.get("/", protect, authorizeRoles("admin", "supervisor"), getElectricity);

// GET /api/electricity/my
router.get("/my", protect, authorizeRoles("user"), getMyElectricity);

export default router;
