import User from "../models/User.js";
import DailyLog from "../models/DailyLog.js";
import Circular from "../models/Circular.js";
import { generateCSV } from "../utils/reportExporter.js";
import bcrypt from 'bcryptjs';
import DriverProfile from "../models/DriverProfile.js";

export const adminRegisterUser = async (req, res) => {
  try {
    const { name, pfNo, role, depotName } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!name || !pfNo || !role || !depotName) {
      return res.status(400).json({
        msg: "All fields are required"
      });
    }

    if (!["DRIVER", "DEPOT_MANAGER"].includes(role)) {
      return res.status(400).json({
        msg: "Invalid role selection"
      });
    }

    /* ---------- CHECK EXISTING ---------- */
    const exists = await User.findOne({ pfNo });
    if (exists) {
      return res.status(400).json({
        msg: "User with this PF No already exists"
      });
    }

    /* ---------- PASSWORD = PF NO ---------- */
    const hashedPassword = await bcrypt.hash(pfNo, 10);

    /* ---------- CREATE USER ---------- */
    const user = await User.create({
      name,
      pfNo,
      password: hashedPassword,
      role,
      depotName,
      passwordChanged: false // Forces password change on first login
    });

    /* ---------- CREATE EMPTY DRIVER PROFILE ---------- */
    if (role === "DRIVER") {
      await DriverProfile.create({
        userId: user._id,
        hrmsId: pfNo // temporary default
      });
    }

    res.status(201).json({
      msg: `${role} registered successfully`
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const downloadAdminReport = async (req, res) => {
  const { from, to, depot } = req.query;

  const start = new Date(from);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  const filter = depot ? { depotName: depot } : {};
  const drivers = await User.find({ role: "DRIVER", ...filter });

  const rows = [];

  for (const d of drivers) {
    const logs = await DailyLog.find({
      driverId: d._id,
      logDate: { $gte: start, $lte: end }
    });

    logs.forEach(l => {
      rows.push({
        Driver: d.name,
        PFNo: d.pfNo,
        Depot: d.depotName,
        Date: l.logDate.toISOString().substring(0, 10),
        Hours: l.hours,
        KM: l.km
      });
    });
  }

  const csv = generateCSV(rows);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=admin_report.csv");
  res.send(csv);
};


export const getAdminUsers = async (req, res) => {
  const { depot } = req.query;
  const filter = depot ? { depotName: depot } : {};

  const managers = await User.find({
    role: "DEPOT_MANAGER",
    ...filter
  }).select("name email pfNo depotName");

  const drivers = await User.find({
    role: "DRIVER",
    ...filter
  }).select("name pfNo depotName");

  res.json({ managers, drivers });
};

export const getAdminReport = async (req, res) => {
  const { from, to, depot } = req.query;

  const start = new Date(from);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  const filter = depot ? { depotName: depot } : {};
  const drivers = await User.find({ role: "DRIVER", ...filter });

  const report = [];

  for (const d of drivers) {
    const logs = await DailyLog.find({
      driverId: d._id,
      logDate: { $gte: start, $lte: end }
    });

    report.push({
      driverName: d.name,
      depot: d.depotName,
      totalKm: logs.reduce((s, l) => s + (l.km || 0), 0),
      totalHours: logs.reduce((s, l) => s + (l.hours || 0), 0),
      logs
    });
  }

  res.json({ from, to, report });
};


export const getDistinctDepots = async (req, res) => {
  try {
    const depots = await User.distinct("depotName", {
      depotName: { $ne: null }
    });

    res.json(depots.sort());
  } catch (err) {
    res.status(500).json({ msg: "Failed to load depots" });
  }
};

/**
 * Get detailed user information for Admin view
 * Supports both DRIVER and DEPOT_MANAGER roles
 */
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch basic user info
    const user = await User.findById(userId)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    let response = {
      ...user,
      profile: null,
      logs: [],
      tcards: [],
      circularStatus: {
        acknowledged: false,
        lastAcknowledgedCircularId: user.lastAcknowledgedCircularId
      }
    };

    // Check circular acknowledgement status
    const latestCircular = await Circular.findOne()
      .sort({ createdAt: -1 })
      .select("_id title")
      .lean();

    if (latestCircular) {
      response.circularStatus.latestCircularId = latestCircular._id;
      response.circularStatus.latestCircularTitle = latestCircular.title;
      response.circularStatus.acknowledged = !!(user.lastAcknowledgedCircularId &&
        user.lastAcknowledgedCircularId.toString() === latestCircular._id.toString());
    } else {
      response.circularStatus.acknowledged = true;
      response.circularStatus.reason = "NO_CIRCULARS";
    }

    // For drivers, fetch additional profile and logs
    if (user.role === "DRIVER") {
      const profile = await DriverProfile.findOne({ userId })
        .lean();

      const logs = await DailyLog.find({ driverId: userId })
        .sort({ logDate: -1 })
        .limit(30)
        .lean();

      // Get T-Card data
      const TCardChecklist = (await import("../models/TCardChecklist.js")).default;
      const tcards = await TCardChecklist.find({ driverId: userId })
        .sort({ date: -1 })
        .limit(10)
        .lean();

      response.profile = profile;
      response.logs = logs;
      response.tcards = tcards;

      // Calculate summary stats
      const totalLogs = await DailyLog.countDocuments({ driverId: userId });
      const totalKm = await DailyLog.aggregate([
        { $match: { driverId: user._id } },
        { $group: { _id: null, total: { $sum: "$km" } } }
      ]);
      const totalHours = await DailyLog.aggregate([
        { $match: { driverId: user._id } },
        { $group: { _id: null, total: { $sum: "$hours" } } }
      ]);

      response.summary = {
        totalDutyLogs: totalLogs,
        totalKm: totalKm[0]?.total || 0,
        totalHours: totalHours[0]?.total || 0,
        totalTCards: await TCardChecklist.countDocuments({ driverId: userId })
      };
    }

    // For managers, get driver count in their depot
    if (user.role === "DEPOT_MANAGER") {
      const driversInDepot = await User.countDocuments({
        role: "DRIVER",
        depotName: user.depotName
      });

      response.summary = {
        driversInDepot
      };
    }

    res.json(response);

  } catch (err) {
    console.error("getUserDetails error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Get T-Card checklist for a specific user by date
 * Supports date filtering for efficient navigation
 *
 * @route GET /admin/users/:userId/tcards
 * @query date - Optional date filter (YYYY-MM-DD format)
 */
export const getUserTCards = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    const TCardChecklist = (await import("../models/TCardChecklist.js")).default;

    let filter = { driverId: userId };

    // If date is provided, filter by that specific date
    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const tcards = await TCardChecklist.find(filter)
      .sort({ date: -1 })
      .lean();

    // Also return list of available dates for the date picker
    const availableDates = await TCardChecklist.distinct("date", { driverId: userId });

    res.json({
      tcards,
      availableDates: availableDates.map(d => new Date(d).toISOString().split('T')[0]).sort().reverse(),
      totalCount: await TCardChecklist.countDocuments({ driverId: userId })
    });

  } catch (err) {
    console.error("getUserTCards error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Update user information (Admin only)
 * Can update both User and DriverProfile data
 *
 * @route PUT /admin/users/:userId
 */
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      // User fields
      name,
      depotName,
      role,
      // Driver Profile fields
      hrmsId,
      designation,
      basicPay,
      dateOfAppointment,
      dateOfEntryAsTWD,
      trainings,
      lrDetails
    } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update user basic info
    if (name) user.name = name;
    if (depotName) user.depotName = depotName;

    // Role change only allowed between DRIVER and DEPOT_MANAGER (not to SUPER_ADMIN)
    if (role && role !== user.role) {
      if (role === "SUPER_ADMIN") {
        return res.status(400).json({ msg: "Cannot promote to Super Admin" });
      }
      if (["DRIVER", "DEPOT_MANAGER"].includes(role)) {
        user.role = role;
      }
    }

    await user.save();

    // If user is a driver, update their profile
    if (user.role === "DRIVER") {
      const profileUpdate = {};

      if (hrmsId) profileUpdate.hrmsId = hrmsId;
      if (designation) profileUpdate.designation = designation;
      if (basicPay !== undefined) profileUpdate.basicPay = basicPay;
      if (dateOfAppointment) profileUpdate.dateOfAppointment = new Date(dateOfAppointment);
      if (dateOfEntryAsTWD) profileUpdate.dateOfEntryAsTWD = new Date(dateOfEntryAsTWD);
      if (trainings) profileUpdate.trainings = trainings;
      if (lrDetails) profileUpdate.lrDetails = lrDetails;

      if (Object.keys(profileUpdate).length > 0) {
        await DriverProfile.findOneAndUpdate(
          { userId },
          { $set: profileUpdate },
          { upsert: true, new: true }
        );
      }
    }

    // Fetch updated data
    const updatedUser = await User.findById(userId).select("-password").lean();
    let profile = null;

    if (updatedUser.role === "DRIVER") {
      profile = await DriverProfile.findOne({ userId }).lean();
    }

    res.json({
      msg: "User updated successfully",
      user: updatedUser,
      profile
    });

  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Delete user (Admin only)
 * Also deletes associated DriverProfile, DailyLogs, and TCardChecklists
 *
 * @route DELETE /admin/users/:userId
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Prevent deleting super admins
    if (user.role === "SUPER_ADMIN") {
      return res.status(400).json({ msg: "Cannot delete Super Admin accounts" });
    }

    // Delete associated data
    if (user.role === "DRIVER") {
      await DriverProfile.deleteOne({ userId });
      await DailyLog.deleteMany({ driverId: userId });
      const TCardChecklist = (await import("../models/TCardChecklist.js")).default;
      await TCardChecklist.deleteMany({ driverId: userId });
    }

    await User.findByIdAndDelete(userId);

    res.json({ msg: "User deleted successfully" });

  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Reset user password (Admin only)
 * Resets password to PF Number and sets passwordChanged to false
 *
 * @route POST /admin/users/:userId/reset-password
 */
export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Reset password to PF Number
    const hashedPassword = await bcrypt.hash(user.pfNo, 10);

    user.password = hashedPassword;
    user.passwordChanged = false;
    await user.save();

    res.json({
      msg: "Password reset successfully",
      note: "User must change password on next login"
    });

  } catch (err) {
    console.error("resetUserPassword error:", err);
    res.status(500).json({ msg: err.message });
  }
};
