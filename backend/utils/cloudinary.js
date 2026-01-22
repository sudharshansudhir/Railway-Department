// utils/cloudinary.js
import dotenv from "dotenv"
dotenv.config()
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "railway_circulars",
    resource_type: "raw",     // 🔥 IMPORTANT
    allowed_formats: ["pdf"], // 🔒 PDF only
  },
});

export const upload = multer({ storage });
export default cloudinary;
