import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import {
  adminRegisterUser,
  getAdminReport,
  getAdminUsers,
  getDistinctDepots,
  downloadAdminReport,
  getUserDetails,
  getUserTCards,
  updateUser,
  deleteUser,
  resetUserPassword,
  getOverdueRecords,
  getSuperAdmins
} from "../controllers/adminController.js";

const router = express.Router();

/* ================= REPORTS ================= */
router.get(
  "/reports",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  getAdminReport
);

router.get(
   "/overdue-records",
   verifyToken,
   allowRoles("SUPER_ADMIN","ADEE","DEPOT_MANAGER", "MASTER_ADMIN"),
   getOverdueRecords
);

/* ================= REGISTER USER ================= */
/* 🔥 ONLY SUPER ADMIN CAN CREATE ADEE */
/* 🔥 MASTER ADMIN CAN CREATE SUPER ADMIN */
router.post(
  "/register",
  verifyToken,
  allowRoles("SUPER_ADMIN", "MASTER_ADMIN"),
  adminRegisterUser
);

/* ================= GET SUPER ADMINS ================= */
router.get(
  "/super-admins",
  verifyToken,
  allowRoles("MASTER_ADMIN"),
  getSuperAdmins
);

/* ================= DEPOTS ================= */
router.get(
  "/depots",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  getDistinctDepots
);

/* ================= USERS ================= */
router.get(
  "/users",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  getAdminUsers
);

router.get(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  getUserDetails
);

router.put(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  updateUser
);

router.delete(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  deleteUser
);

router.post(
  "/users/:userId/reset-password",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  resetUserPassword
);

router.get(
  "/users/:userId/tcards",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  getUserTCards
);

router.get(
  "/reports/download",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  downloadAdminReport
);

export default router;