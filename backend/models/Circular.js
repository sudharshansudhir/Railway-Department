// models/Circular.js
import mongoose from "mongoose";

const circularSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  originalFilename: { type: String }, // Store original filename
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Circular", circularSchema);
