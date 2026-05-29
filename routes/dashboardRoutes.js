import express from "express";
import {
  getAdminStats,
  getSupervisorStats,
  getUserStats,
} from "../controllers/dashboardController.js";
import { protect, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/admin", protect, authorizeRoles("admin"), getAdminStats);
router.get(
  "/supervisor",
  protect,
  authorizeRoles("supervisor"),
  getSupervisorStats,
);
router.get("/user", protect, authorizeRoles("user"), getUserStats);

export default router;