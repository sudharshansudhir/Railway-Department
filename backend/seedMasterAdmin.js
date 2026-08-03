// ============================================================
// seedMasterAdmin.js
// Run once to create the Master Admin user in MongoDB
// Usage: node seedMasterAdmin.js
// ============================================================

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// ── Inline User schema (avoids import issues when run standalone) ──
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pfNo: { type: String, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["DRIVER", "DEPOT_MANAGER", "SUPER_ADMIN", "ADEE", "MASTER_ADMIN"],
      required: true,
    },
    depotName: { type: String },
    passwordChanged: { type: Boolean, default: false },
    lastAcknowledgedCircularId: { type: mongoose.Schema.Types.ObjectId, default: null },
    assignedDepots: [{ type: String }],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

// ── Credentials ──
const PF_NO   = "MASTER001";
const NAME    = "Master Admin";
const ROLE    = "MASTER_ADMIN";
const PASSWORD = "MASTER001"; // default password = PF No

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if Master Admin already exists
    const existing = await User.findOne({ pfNo: PF_NO });
    if (existing) {
      console.log("⚠️  Master Admin already exists with PF No:", PF_NO);
      console.log("   Role:", existing.role);
      console.log("   No changes made.");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // Create Master Admin user
    const masterAdmin = await User.create({
      name: NAME,
      pfNo: PF_NO,
      password: hashedPassword,
      role: ROLE,
      passwordChanged: true, // skip forced password change on first login
      depotName: "",
      assignedDepots: [],
    });

    console.log("✅ Master Admin created successfully!");
    console.log("─────────────────────────────────");
    console.log("  Name     :", masterAdmin.name);
    console.log("  PF No    :", masterAdmin.pfNo);
    console.log("  Password :", PASSWORD, " (login with this)");
    console.log("  Role     :", masterAdmin.role);
    console.log("─────────────────────────────────");
    console.log("Login at: http://localhost:5173");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating Master Admin:", err.message);
    process.exit(1);
  }
}

seed();
