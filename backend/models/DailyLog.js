// models/DailyLog.js
import mongoose from "mongoose";
const dailyLogSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  logDate: {
    type: Date,
    default: () => new Date().setHours(0,0,0,0)
  },

  signInTime: Date,
  signInStation: String,

  signOutTime: Date,
  signOutStation: String,

  hours: Number,
  km: Number,
  mileage: Number

}, { timestamps: true });


export default mongoose.model("DailyLog", dailyLogSchema);
