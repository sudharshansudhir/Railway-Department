import User from "../models/User.js";
import DailyLog from "../models/DailyLog.js";

import DriverProfile from "../models/DriverProfile.js";

// import User from "../models/User.js";
// import DriverProfile from "../models/DriverProfile.js";
// import DailyLog from "../models/DailyLog.js";

export const getDriverFullProfile = async (req, res) => {
  try {
    const driverId = req.params.driverId;

    /* 🔒 Ensure same depot */
    const driver = await User.findOne({
      _id: driverId,
      role: "DRIVER",
      depotName: req.user.depotName
    }).select("name pfNo depotName");

    if (!driver) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const profile = await DriverProfile.findOne({ userId: driverId });

    const logs = await DailyLog.find({ driverId })
      .sort({ logDate: -1 });

    res.json({
      name: driver.name,
      pfNo: driver.pfNo,
      depotName: driver.depotName,
      profile,
      logs            // ✅ IMPORTANT
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// Current function to get only drivers (keep it if needed)
export const getDepotDrivers = async (req, res) => {
  const drivers = await User.find({
    role: "DRIVER",
    depotName: req.user.depotName
  }).select("name pfNo depotName"); // only return necessary fields

  res.json(drivers);
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
