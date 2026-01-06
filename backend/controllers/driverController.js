import DriverProfile from "../models/DriverProfile.js";
import DailyLog from "../models/DailyLog.js";

/* VIEW OWN PROFILE */
export const getDriverProfile = async (req, res) => {
  const profile = await DriverProfile.findOne({ userId: req.user.id });
  res.json(profile);
};

/* SIGN IN */
export const driverSignIn = async (req, res) => {
  const activeLog = await DailyLog.findOne({
    driverId: req.user.id,
    signOutTime: null
  });

  if (activeLog) {
    return res.status(400).json({ msg: "Already signed in" });
  }

  await DailyLog.create({
    driverId: req.user.id,
    signInTime: new Date(),
    signInStation: req.body.station
  });

  res.json({ msg: "Signed in successfully" });
};


/* SIGN OUT */
export const driverSignOut = async (req, res) => {
  const { hours, km, mileage, station } = req.body;

  if (!hours || !km || !mileage) {
    return res.status(400).json({ msg: "Hours, KM, Mileage required" });
  }

  const log = await DailyLog.findOne({
    driverId: req.user.id,
    signOutTime: null
  });

  if (!log) {
    return res.status(400).json({ msg: "No active sign-in found" });
  }

  log.signOutTime = new Date();
  log.signOutStation = station;
  log.hours = hours;
  log.km = km;
  log.mileage = mileage;

  await log.save();

  res.json({ msg: "Logout successful" });
};

/* ALERTS */
export const driverAlerts = async (req, res) => {
  const profile = await DriverProfile.findOne({ userId: req.user.id });

  const alerts = [];
  const today = new Date();

  if (profile.training?.dueDate < today) alerts.push("Training overdue");
  if (profile.lrDetails?.dueDate < today) alerts.push("LR overdue");

  res.json(alerts);
};
