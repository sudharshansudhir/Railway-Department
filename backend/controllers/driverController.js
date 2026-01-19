import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import DailyLog from "../models/DailyLog.js";

/* ======================================================
   PROFILE
====================================================== */

/* VIEW OWN PROFILE */
export const getDriverProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("name pfNo depotName");

  const profile = await DriverProfile.findOne({ userId: req.user.id });

  res.json({ user, profile });
};

/* UPDATE BIO DATA */
export const updateBioData = async (req, res) => {
  const {
    hrmsId,
    designation,
    basicPay,
    dateOfAppointment,
    dateOfEntryAsTWD
  } = req.body;

  const updated = await DriverProfile.findOneAndUpdate(
    { userId: req.user.id },
    {
      hrmsId,
      designation,
      basicPay,
      dateOfAppointment,
      dateOfEntryAsTWD
    },
    { new: true, upsert: true }
  );

  res.json(updated);
};

/* ======================================================
   TRAINING (UPDATED TO NEW SCHEMA)
====================================================== */

/* UPDATE TRAININGS (PME / GRS_RC / TR4 / OC) */
export const updateTraining = async (req, res) => {
  const { trainings } = req.body;

  if (!trainings) {
    return res.status(400).json({ msg: "Training data missing" });
  }

  const updated = await DriverProfile.findOneAndUpdate(
    { userId: req.user.id },
    { $set: { trainings } },
    { new: true, upsert: true }
  );

  res.json({
    msg: "Training details updated successfully",
    trainings: updated.trainings
  });
};

/* ======================================================
   LR (NO SECTION)
====================================================== */

/* ======================================================
   LR – MULTIPLE ENTRIES
====================================================== */

export const updateLR = async (req, res) => {
  const { lrDetails } = req.body;

  if (
    !lrDetails?.section ||
    !lrDetails?.doneDate ||
    !lrDetails?.dueDate
  ) {
    return res.status(400).json({
      msg: "LR Section, Done Date and Due Date are mandatory"
    });
  }

  const updated = await DriverProfile.findOneAndUpdate(
    { userId: req.user.id },
    {
      $push: {
        lrDetails: lrDetails
      }
    },
    { new: true, upsert: true }
  );

  res.json({
    msg: "LR entry added successfully",
    lrDetails: updated.lrDetails
  });
};


/* ======================================================
   DUTY LOG
====================================================== */

/* SIGN IN */
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

/* SIGN OUT */
export const driverSignOut = async (req, res) => {
  const { toStation, hours, km ,breathAnalyserDone} = req.body;

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
  log.breathAnalyserDone=breathAnalyserDone;
  log.mileage = log.hours * 20 + log.km;

  await log.save();

  res.json({ msg: "Signed out successfully" });
};

/* ======================================================
   ALERTS (UPDATED FOR MULTI-TRAINING)
====================================================== */

export const driverAlerts = async (req, res) => {
  const profile = await DriverProfile.findOne({ userId: req.user.id });
  const today = new Date();
  const alerts = [];

  /* TRAINING ALERTS */
  if (profile?.trainings) {
    Object.entries(profile.trainings).forEach(([key, value]) => {
      if (value?.dueDate && value.dueDate < today) {
        alerts.push({
          type: "TRAINING",
          message: `${key} training overdue`
        });
      }
    });
  }

  /* 🔥 LR ALERT – CHECK LATEST ENTRY */
  if (profile?.lrDetails?.length) {
    const latestLR = profile.lrDetails.at(-1);
    if (latestLR?.dueDate && latestLR.dueDate < today) {
      alerts.push({
        type: "LR",
        message: `LR overdue for ${latestLR.section}`
      });
    }
  }

  res.json(alerts);
};
/* ======================================================
   DUTY STATUS CHECKS
====================================================== */

/* CHECK ACTIVE DUTY */
export const checkActiveDuty = async (req, res) => {
  const activeLog = await DailyLog.findOne({
    driverId: req.user.id,
    signOutTime: null
  });
  // console.log(activeLog)

  res.json({ active: !!activeLog });
};

/* GET YESTERDAY DUTY STATUS */
export const getDutyStatus = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const log = await DailyLog.findOne({
    driverId: req.user.id,
    logDate: yesterday
  });

  if (!log) return res.json({ status: "NO_DUTY" });
  if (!log.signOutTime) return res.json({ status: "INCOMPLETE" });

  res.json({ status: "COMPLETED" });
};
