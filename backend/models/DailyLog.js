import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  logDate: {
    type: Date,
    default: () => new Date().setHours(0, 0, 0, 0),
    index: true
  },

  signInTime: Date,
  signOutTime: Date,

  fromStation: String,
  toStation: String,

  twNumber: String,

  hours: Number,
  km: Number,
  mileage: Number,

  breathAnalyserDone: Boolean,
  breathAnalyserinitial: Boolean
}, { timestamps: true });

export default mongoose.model("DailyLog", dailyLogSchema);
