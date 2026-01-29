import mongoose from "mongoose";

const circularSchema = new mongoose.Schema(
  {
    title: {
      type: String, 
      required: true,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Circular", circularSchema);
