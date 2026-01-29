import cloudinary from "../utils/cloudinary.js";
import Circular from "../models/Circular.js";
import User from "../models/User.js";

export const uploadCircular = async (req, res) => {
  try {
    if (!req.file || !req.body.title) {
      return res.status(400).json({ message: "Title and PDF required" });
    }

    // 🔥 Convert buffer → base64
    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder: "circulars",
  resource_type: "raw",        // ✅ FORCE RAW
  access_mode: "public", // IMPORTANT
      use_filename: true,
      unique_filename: true,
    });

    const circular = await Circular.create({
      title: req.body.title,
      pdfUrl: result.secure_url,
      publicId: result.public_id,
      originalFilename: req.file.originalname,
    });

    res.status(201).json(circular);
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
};

/* =======================
   GET ALL CIRCULARS
======================= */
export const getCirculars = async (req, res) => {
  try {
    const circulars = await Circular.find().sort({ createdAt: -1 });
    res.json(circulars);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch circulars" });
  }
};

/* =======================
   STREAM PDF (VIEW / DOWNLOAD)
======================= */
export const getCircularPDF = async (req, res) => {
  const circular = await Circular.findById(req.params.id);

  if (!circular) {
    return res.status(404).json({ message: "Not found" });
  }

  // Force inline display
  res.setHeader("Content-Disposition", "inline");
  res.redirect(circular.pdfUrl);
};
export const acknowledgeCircular = async (req, res) => {
  try {
    const { id } = req.params;

    const circular = await Circular.findById(id);
    if (!circular) {
      return res.status(404).json({ msg: "Circular not found" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      lastAcknowledgedCircularId: id,
      lastAcknowledgedAt: new Date(),
    });

    res.json({
      msg: "Circular acknowledged successfully",
      circularId: id,
    });

  } catch (err) {
    console.error("Acknowledge failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getCircularAcknowledgementReport = async (req, res) => {
  try {
    const { circularId } = req.query;

    if (!circularId) {
      return res.status(400).json({ msg: "Circular ID required" });
    }

    const circular = await Circular.findById(circularId);
    if (!circular) {
      return res.status(404).json({ msg: "Circular not found" });
    }

    // Fetch all users except admins if needed
    const users = await User.find({
      role: { $ne: "SUPER_ADMIN" }
    }).select("name pfNo role depotName lastAcknowledgedCircularId lastAcknowledgedAt");

    const reportUsers = users.map(user => {
      const acknowledged =
        user.lastAcknowledgedCircularId?.toString() === circularId;

      return {
        _id: user._id,
        name: user.name,
        pfNo: user.pfNo,
        role: user.role,
        depotName: user.depotName,
        acknowledged,
        acknowledgedAt: acknowledged ? user.lastAcknowledgedAt : null
      };
    });

    const acknowledgedCount = reportUsers.filter(u => u.acknowledged).length;
    const total = reportUsers.length;

    res.json({
      circular: {
        _id: circular._id,
        title: circular.title
      },
      summary: {
        total,
        acknowledged: acknowledgedCount,
        pending: total - acknowledgedCount,
        percentComplete: total === 0
          ? 0
          : Math.round((acknowledgedCount / total) * 100)
      },
      users: reportUsers
    });

  } catch (err) {
    console.error("Ack report error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};