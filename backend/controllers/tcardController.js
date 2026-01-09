import TCardChecklist from "../models/TCardChecklist.js";
import User from "../models/User.js";

export const getDriverTCardsForDepot = async (req, res) => {
  try {
    const { driverId } = req.params;

    // 🔒 Ensure driver belongs to same depot
    const driver = await User.findOne({
      _id: driverId,
      role: "DRIVER",
      depotName: req.user.depotName
    });

    if (!driver) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const tcards = await TCardChecklist.find({
      driverId
    }).sort({ date: -1 });

    res.json(tcards);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const saveTCard = async (req, res) => {
  const { tCarNo, items } = req.body;

  if (!tCarNo || !items?.length) {
    return res.status(400).json({ msg: "Incomplete checklist" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await TCardChecklist.findOne({
    driverId: req.user.id,
    date: today
  });

  if (existing) {
    return res.status(400).json({
      msg: "Today's checklist already submitted"
    });
  }

  await TCardChecklist.create({
    driverId: req.user.id,
    tCarNo,
    items
  });

  res.json({ msg: "Daily T-Card checklist saved" });
};
