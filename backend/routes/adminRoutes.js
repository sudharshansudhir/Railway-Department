import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import { getAdminReport } from "../controllers/adminController.js";

const router = express.Router();
router.get(
  "/reports",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  getAdminReport
);


export default router;
