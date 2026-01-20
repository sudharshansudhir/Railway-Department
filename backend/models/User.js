// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pfNo: { type: String, unique: true }, // mainly for driver
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["DRIVER", "DEPOT_MANAGER", "SUPER_ADMIN"],
    required: true
  },

  depotName: { type: String }, // for driver & depot manager

}, { timestamps: true });

export default mongoose.model("User", userSchema);
