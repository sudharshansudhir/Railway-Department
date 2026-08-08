import express from "express";
import upload from "../middleware/multer.js";

import {
  uploadCircular,
  getCirculars,
  getCircularPDF,
  acknowledgeCircular,
  getCircularAcknowledgementReport,
} from "../controllers/circularController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* =========================================
   UPLOAD CIRCULAR
========================================= */

router.post(
  "/circulars",
  verifyToken,
  upload.single("pdf"),
  uploadCircular
);

/* =========================================
   GET CIRCULARS
========================================= */

router.get(
  "/circulars",
  verifyToken,
  getCirculars
);

/* =========================================
   ACKNOWLEDGE
========================================= */

router.post(
  "/circulars/:id/acknowledge",
  verifyToken,
  acknowledgeCircular
);

/* =========================================
   ACKNOWLEDGEMENT REPORT
========================================= */

router.get(
  "/circulars/acknowledgement-report",
  verifyToken,
  getCircularAcknowledgementReport
);

/* =========================================
   VIEW / DOWNLOAD PDF
========================================= */

router.get(
  "/circulars/:id/pdf",
  verifyToken,
  getCircularPDF
);

export default router;