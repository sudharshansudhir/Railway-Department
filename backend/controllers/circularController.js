import Circular from "../models/Circular.js";
import User from "../models/User.js";

/**
 * Upload a new circular (Admin only)
 * Stores the PDF in Cloudinary and saves metadata
 */
export const uploadCircular = async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ msg: "PDF file is required" });

    const circular = await Circular.create({
      title,
      pdfUrl: req.file.path, // Cloudinary URL
      originalFilename: req.file.originalname, // Preserve original filename
      postedBy: req.user.id
    });

    res.status(201).json({ msg: "Circular uploaded successfully", circular });
  } catch (err) {
    console.error("Circular upload error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Get all circulars (for listing)
 * Excludes SUPER_ADMIN from viewing (they manage, not consume)
 */
export const getCirculars = async (req, res) => {
  try {
    const circulars = await Circular.find().sort({ createdAt: -1 });
    res.json(circulars);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Get the latest circular
 * Returns the most recent circular for acknowledgement check
 */
export const getLatestCircular = async (req, res) => {
  try {
    const latestCircular = await Circular.findOne()
      .sort({ createdAt: -1 })
      .lean();

    if (!latestCircular) {
      return res.json({
        hasUnacknowledged: false,
        circular: null
      });
    }

    // Get user's last acknowledged circular
    const user = await User.findById(req.user.id)
      .select("lastAcknowledgedCircularId")
      .lean();

    // Check if user needs to acknowledge
    const hasUnacknowledged = !user.lastAcknowledgedCircularId ||
      user.lastAcknowledgedCircularId.toString() !== latestCircular._id.toString();

    res.json({
      hasUnacknowledged,
      circular: hasUnacknowledged ? latestCircular : null
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Acknowledge a circular
 * Updates user's lastAcknowledgedCircularId
 */
export const acknowledgeCircular = async (req, res) => {
  try {
    const { circularId } = req.body;

    if (!circularId) {
      return res.status(400).json({ msg: "Circular ID is required" });
    }

    // Verify circular exists
    const circular = await Circular.findById(circularId);
    if (!circular) {
      return res.status(404).json({ msg: "Circular not found" });
    }

    // Get the latest circular
    const latestCircular = await Circular.findOne().sort({ createdAt: -1 });

    // Ensure user is acknowledging the latest circular
    if (latestCircular._id.toString() !== circularId) {
      return res.status(400).json({
        msg: "You must acknowledge the latest circular"
      });
    }

    // Update user's acknowledgement
    await User.findByIdAndUpdate(req.user.id, {
      lastAcknowledgedCircularId: circularId
    });

    res.json({
      msg: "Circular acknowledged successfully",
      acknowledgedCircularId: circularId
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Check circular acknowledgement status (for middleware/guards)
 * Returns whether user has acknowledged the latest circular
 */
export const checkAcknowledgementStatus = async (req, res) => {
  try {
    const latestCircular = await Circular.findOne()
      .sort({ createdAt: -1 })
      .select("_id")
      .lean();

    // No circulars exist - no acknowledgement needed
    if (!latestCircular) {
      return res.json({
        acknowledged: true,
        reason: "NO_CIRCULARS"
      });
    }

    const user = await User.findById(req.user.id)
      .select("lastAcknowledgedCircularId")
      .lean();

    const acknowledged = !!(user.lastAcknowledgedCircularId &&
      user.lastAcknowledgedCircularId.toString() === latestCircular._id.toString());

    res.json({
      acknowledged,
      latestCircularId: latestCircular._id,
      userAcknowledgedId: user.lastAcknowledgedCircularId || null
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Get circular acknowledgement report for Admin
 * Shows all users and their acknowledgement status for each circular
 */
export const getCircularAcknowledgementReport = async (req, res) => {
  try {
    const { circularId } = req.query;

    // Get the target circular (latest if not specified)
    let targetCircular;
    if (circularId) {
      targetCircular = await Circular.findById(circularId).lean();
      if (!targetCircular) {
        return res.status(404).json({ msg: "Circular not found" });
      }
    } else {
      targetCircular = await Circular.findOne().sort({ createdAt: -1 }).lean();
    }

    if (!targetCircular) {
      return res.json({
        circular: null,
        users: [],
        summary: { total: 0, acknowledged: 0, pending: 0 }
      });
    }

    // Get all users who need to acknowledge (Drivers & Depot Managers)
    const users = await User.find({
      role: { $in: ["DRIVER", "DEPOT_MANAGER"] }
    })
      .select("name pfNo role depotName lastAcknowledgedCircularId")
      .sort({ role: 1, depotName: 1, name: 1 })
      .lean();

    // Map users with acknowledgement status
    const usersWithStatus = users.map(user => {
      const hasAcknowledged = user.lastAcknowledgedCircularId &&
        user.lastAcknowledgedCircularId.toString() === targetCircular._id.toString();

      return {
        _id: user._id,
        name: user.name,
        pfNo: user.pfNo,
        role: user.role,
        depotName: user.depotName,
        acknowledged: hasAcknowledged,
        lastAcknowledgedCircularId: user.lastAcknowledgedCircularId
      };
    });

    // Calculate summary
    const acknowledged = usersWithStatus.filter(u => u.acknowledged).length;
    const pending = usersWithStatus.filter(u => !u.acknowledged).length;

    res.json({
      circular: {
        _id: targetCircular._id,
        title: targetCircular.title,
        createdAt: targetCircular.createdAt
      },
      users: usersWithStatus,
      summary: {
        total: users.length,
        acknowledged,
        pending,
        percentComplete: users.length > 0
          ? Math.round((acknowledged / users.length) * 100)
          : 100
      }
    });

  } catch (err) {
    console.error("Acknowledgement report error:", err);
    res.status(500).json({ msg: err.message });
  }
};

