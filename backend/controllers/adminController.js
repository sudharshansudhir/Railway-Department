import User from "../models/User.js";
import DailyLog from "../models/DailyLog.js";import { generateCSV } from "../utils/reportExporter.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
      depotName
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
