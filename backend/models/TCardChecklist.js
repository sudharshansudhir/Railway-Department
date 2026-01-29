import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
  description: String,
  checked: Boolean,
  remarks: String
}, { _id: false });

const tCardChecklistSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  date: {
    type: Date,
    default: () => new Date().setHours(0, 0, 0, 0),
    index: true
  },

  tCarNo: {
    type: String,
    required: true
  },

  items: [checklistItemSchema]

}, { timestamps: true });

// Compound index for efficient queries by driver and date
tCardChecklistSchema.index({ driverId: 1, date: -1 });

export default mongoose.model("TCardChecklist", tCardChecklistSchema);
