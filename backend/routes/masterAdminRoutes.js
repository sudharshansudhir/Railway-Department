import express from "express";

import {

verifyToken,

allowRoles

} from "../middleware/auth.js";

import {

createSuperAdmin,

getAllSuperAdmins,

dashboardSummary,

updateSuperAdmin,

deleteSuperAdmin,
switchToSuperAdmin

} from "../controllers/masterAdminController.js";

const router = express.Router();

/* ===================================
MASTER ADMIN ONLY
=================================== */

router.post(

"/create-super-admin",

verifyToken,

allowRoles("MASTER_ADMIN"),

createSuperAdmin

);

router.get(

"/super-admins",

verifyToken,

allowRoles("MASTER_ADMIN"),

getAllSuperAdmins

);

router.get(

"/summary",

verifyToken,

allowRoles("MASTER_ADMIN"),

dashboardSummary

);

router.put(

"/super-admin/:id",

verifyToken,

allowRoles("MASTER_ADMIN"),

updateSuperAdmin

);

router.delete(

"/super-admin/:id",

verifyToken,

allowRoles("MASTER_ADMIN"),

deleteSuperAdmin

);

router.post(

"/switch/:id",

verifyToken,

allowRoles("MASTER_ADMIN"),

switchToSuperAdmin
    
);

export default router;