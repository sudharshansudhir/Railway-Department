import User from "../models/User.js";
import DailyLog from "../models/DailyLog.js";


export const getAdminReport = async (req, res) => {
  const { from, to, depot } = req.query;

  const filter = depot ? { depotName: depot } : {};

  const drivers = await User.find({ role: "DRIVER", ...filter });

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


    report.push({
      driverName: driver.name,
      depot: driver.depotName,
      totalKm: logs.reduce((s, l) => s + (l.km || 0), 0),
      totalHours: logs.reduce((s, l) => s + (l.hours || 0), 0),
      logs
    });
  }

  res.json({ from, to, report });
};
