import User from "../models/User.js";
import DailyLog from "../models/DailyLog.js";
import Circular from "../models/Circular.js";
import DriverProfile from "../models/DriverProfile.js";

/**
 * Get full driver profile for Depot Manager view
 * Includes profile, logs, and circular status
 */
export const getDriverFullProfile = async (req, res) => {
  try {
    const { driverId } = req.params;
    const depotName = req.user.depotName;

    const user = await User.findOne({
      _id: driverId,
      role: "DRIVER",
      depotName // Security check - only same depot
    }).select("-password").lean();

    if (!user) {
      return res.status(403).json({
        msg: "Access denied to this driver"
      });
    }

    const profile = await DriverProfile.findOne({
      userId: driverId
    }).lean();

    const logs = await DailyLog.find({
      driverId
    }).sort({ logDate: -1 }).limit(30).lean();

    // Get circular acknowledgement status
    const latestCircular = await Circular.findOne()
      .sort({ createdAt: -1 })
      .select("_id title")
      .lean();

    let circularStatus = {
      acknowledged: true,
      lastAcknowledgedCircularId: user.lastAcknowledgedCircularId
    };

    if (latestCircular) {
      circularStatus.latestCircularId = latestCircular._id;
      circularStatus.latestCircularTitle = latestCircular.title;
      circularStatus.acknowledged = !!(user.lastAcknowledgedCircularId &&
        user.lastAcknowledgedCircularId.toString() === latestCircular._id.toString());
    }

    // Calculate summary
    const totalLogs = await DailyLog.countDocuments({ driverId });
    const kmAgg = await DailyLog.aggregate([
      { $match: { driverId: user._id } },
      { $group: { _id: null, total: { $sum: "$km" } } }
    ]);
    const hoursAgg = await DailyLog.aggregate([
      { $match: { driverId: user._id } },
      { $group: { _id: null, total: { $sum: "$hours" } } }
    ]);

    res.json({
      ...user,
      profile,
      logs,
      circularStatus,
      summary: {
        totalDutyLogs: totalLogs,
        totalKm: kmAgg[0]?.total || 0,
        totalHours: hoursAgg[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// Current function to get only drivers (keep it if needed)
export const getDepotDrivers = async (req, res) => {
  try {
    const depotName = req.user.depotName; // 🔥 FROM JWT

    if (!depotName) {
      return res.status(400).json({
        msg: "Depot not assigned to this manager"
      });
    }

    const drivers = await User.find({
      role: "DRIVER",
      depotName: depotName // 🔥 CRITICAL FILTER
    })
      .select("name pfNo depotName")
      .sort({ name: 1 });

    res.json(drivers);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// NEW: Get depot drivers + their daily logs
export const getDepotDailyLogs = async (req, res) => {
  try {
    const depot = req.user.depotName;

    // Get all drivers in this depot
    const drivers = await User.find({ role: "DRIVER", depotName: depot });

    const logs = [];

    for (let driver of drivers) {
      const driverLogs = await DailyLog.find({ driverId: driver._id })
        .sort({ signInTime: -1 }); // latest logs first

      logs.push({
        driverName: driver.name,
        pfNo: driver.pfNo,
        dailyLogs: driverLogs
      });
    }

    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getDepotReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const drivers = await User.find({
      role: "DRIVER",
      depotName: req.user.depotName
    });

    const report = [];

    for (let driver of drivers) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);

      const end = new Date(to);
      end.setHours(23, 59, 59, 999);

      const logs = await DailyLog.find({
        driverId: driver._id,
        logDate: {
          $gte: start,
          $lte: end
        }
      });


      const totalHours = logs.reduce((sum, l) => sum + (l.hours || 0), 0);
      const totalKm = logs.reduce((sum, l) => sum + (l.km || 0), 0);

      report.push({
        driverName: driver.name,
        pfNo: driver.pfNo,
        totalDays: logs.length,
        totalHours,
        totalKm,
        logs
      });
    }

    res.json({
      depot: req.user.depotName,
      from,
      to,
      report
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
