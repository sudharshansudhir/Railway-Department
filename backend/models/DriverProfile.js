import mongoose from "mongoose";

const driverProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  hrmsId: {
    type: String,
    required: true
  },

  designation: String,
  basicPay: Number,

  dateOfAppointment: Date,

  // 🔹 IMPORTANT: Explicit railway terminology
  dateOfEntryAsTWD: Date,

  training: {
    section: String,
    doneDate: Date,
    dueDate: Date,
    schedule: String
  },

  lrDetails: {
    section:String,
    doneDate: Date,
    dueDate: Date,
    schedule: String
  }

}, { timestamps: true });

export default mongoose.model("DriverProfile", driverProfileSchema);
