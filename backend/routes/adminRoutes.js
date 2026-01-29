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
  resetUserPassword
} from "../controllers/adminController.js";

const router = express.Router();

// Get admin report summary
router.get(
  "/reports",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  getAdminReport
);

// Register new user (driver or depot manager)
router.post(
  "/register",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  adminRegisterUser
);

// Get distinct depot names
router.get(
  "/depots",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  getDistinctDepots
);

// Get all users (managers and drivers)
router.get(
  "/users",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  getAdminUsers
);

// Get specific user details (Driver or Manager)
router.get(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  getUserDetails
);

// Update user information
router.put(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  updateUser
);

// Delete user
router.delete(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  deleteUser
);

// Reset user password
router.post(
  "/users/:userId/reset-password",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  resetUserPassword
);

// Get T-Cards for a specific user with optional date filter
router.get(
  "/users/:userId/tcards",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  getUserTCards
);

// Download admin report as CSV
router.get(
  "/reports/download",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  downloadAdminReport
);

export default router;
