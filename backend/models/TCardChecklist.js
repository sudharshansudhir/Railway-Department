import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
  description: String,
  checked: Boolean,
  remarks: String
});

const tCardChecklistSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
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

export default mongoose.model("TCardChecklist", tCardChecklistSchema);
