// utils/cloudinary.js
import dotenv from "dotenv"
dotenv.config()
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary Storage Configuration for PDF Circulars
 *
 * Settings:
 * - resource_type: "raw" for PDFs
 * - folder: railway_circulars
 * - public_id: preserves original filename (without extension)
 * - format: pdf
 *
 * The upload adds flags for inline viewing (fl_attachment:false)
 */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Extract original filename without extension
    const originalName = path.parse(file.originalname).name;
    // Clean filename (remove special characters)
    const cleanName = originalName.replace(/[^a-zA-Z0-9_-]/g, '_');
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now();

    return {
      folder: "railway_circulars",
      resource_type: "raw",
      public_id: `${cleanName}_${timestamp}`,
      format: "pdf",
      // Flags for inline viewing
      flags: "attachment:false",
      // Set content disposition to inline
      type: "upload",
      access_mode: "public"
    };
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

export default cloudinary;
