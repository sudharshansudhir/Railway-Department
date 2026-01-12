import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import { adminRegisterUser, getAdminReport, getAdminUsers, getDistinctDepots } from "../controllers/adminController.js";
import { downloadAdminReport } from "../controllers/adminController.js";




const router = express.Router();

router.get(
  "/reports",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  getAdminReport
);

router.post(
  "/register",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  adminRegisterUser
);

router.get(
  "/depots",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  getDistinctDepots
);



router.get(
  "/users",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  getAdminUsers
);

router.get(
  "/reports/download",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  downloadAdminReport
);

export default router;
