import DriverProfile from "../models/DriverProfile.js";
import DailyLog from "../models/DailyLog.js";

/* ===================== PROFILE ===================== */

/* VIEW OWN PROFILE */
import User from "../models/User.js";
// import DriverProfile from "../models/DriverProfile.js";

export const getDriverProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("name pfNo depotName");

  const profile = await DriverProfile.findOne({ userId: req.user.id });

  res.json({
    user,
    profile
  });
};


/* UPDATE BIO DATA */
export const updateBioData = async (req, res) => {
  const { hrmsId,designation, basicPay, dateOfEntry, dateOfAppointment,dateOfEntryAsTWD } = req.body;

  const updated = await DriverProfile.findOneAndUpdate(
    { userId: req.user.id },
    {
      hrmsId,
      designation,
      basicPay,
      dateOfEntry,
      dateOfAppointment,
      dateOfEntryAsTWD
    },
    { new: true }
  );

  res.json(updated);
};

/* UPDATE TRAINING */
export const updateTraining = async (req, res) => {
  const { training } = req.body;

  if (!training?.section || !training?.doneDate || !training?.dueDate) {
    return res.status(400).json({ msg: "Incomplete training details" });
  }

  const updated = await DriverProfile.findOneAndUpdate(
    { userId: req.user.id },
    { training },
    { new: true }
  );

  res.json(updated);
};

/* UPDATE LR */
export const updateLR = async (req, res) => {
  try {
    const { lrDetails } = req.body;

    if (!lrDetails?.section || !lrDetails?.doneDate || !lrDetails?.dueDate) {
      return res.status(400).json({
        msg: "LR Section, Done Date and Due Date are mandatory"
      });
    }

    const profile = await DriverProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { lrDetails } },
      { new: true, upsert: true }
    );

    res.json({
      msg: "LR details updated successfully",
      lrDetails: profile.lrDetails
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


/* ===================== DUTY LOG ===================== */
/* ================= SIGN IN ================= */

/* ================= SIGN IN ================= */
export const driverSignIn = async (req, res) => {
  const { fromStation, twNumber, breathAnalyserDone } = req.body;

  if (!fromStation || !twNumber) {
    return res.status(400).json({ msg: "Missing sign-in data" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await DailyLog.findOne({
    driverId: req.user.id,
    logDate: today,
    signOutTime: { $exists: false }
  });

  if (existing) {
    return res.status(400).json({ msg: "Already signed in" });
  }

  await DailyLog.create({
    driverId: req.user.id,
    logDate: today,
    signInTime: new Date(),
    fromStation,
    twNumber,
    breathAnalyserDone
  });

  res.json({ msg: "Signed in successfully" });
};

/* ================= SIGN OUT ================= */
export const driverSignOut = async (req, res) => {
  const { toStation, hours, km } = req.body;

  if (!toStation || !hours || !km) {
    return res.status(400).json({ msg: "Missing sign-out data" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const log = await DailyLog.findOne({
    driverId: req.user.id,
    logDate: today,
    signOutTime: { $exists: false }
  });

  if (!log) {
    return res.status(400).json({ msg: "No active duty found" });
  }

  log.signOutTime = new Date();
  log.toStation = toStation;
  log.hours = Number(hours);
  log.km = Number(km);
  log.mileage = log.hours * 20 + log.km;

  await log.save();

  res.json({ msg: "Signed out successfully" });
};



/* ===================== ALERTS ===================== */

export const driverAlerts = async (req, res) => {
  const profile = await DriverProfile.findOne({ userId: req.user.id });
  const today = new Date();

  const alerts = [];

  if (profile?.training?.dueDate && profile.training.dueDate < today) {
    alerts.push({ type: "TRAINING", message: "Training overdue" });
  }

  if (profile?.lrDetails?.dueDate && profile.lrDetails.dueDate < today) {
    alerts.push({ type: "LR", message: "LR overdue" });
  }

  res.json(alerts);
};

export const checkActiveDuty = async (req, res) => {
  try {
    const activeLog = await DailyLog.findOne({
      driverId: req.user.id,
      signOutTime: null
    });

    res.json({
      active: !!activeLog
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to check duty status" });
  }
};

export const getDutyStatus = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const log = await DailyLog.findOne({
    driverId: req.user.id,
    logDate: yesterday
  });

  if (!log) {
    return res.json({ status: "NO_DUTY" });
  }

  if (!log.signOutTime) {
    return res.json({ status: "INCOMPLETE" });
  }

  res.json({ status: "COMPLETED" });
};