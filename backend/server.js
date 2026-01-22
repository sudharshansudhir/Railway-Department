import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from 'cors'

import authRoutes from "./routes/authRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import depotRoutes from "./routes/depotRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import circularRoutes from "./routes/circularRoutes.js";
import bcrypt from "bcryptjs";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error", err));

app.get("/", (req, res) => {
  res.send("Railway Backend Running");
});

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/driver", driverRoutes);
app.use("/depot", depotRoutes);
app.use("/admin", adminRoutes);
app.use("/admin", circularRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async() => {
  console.log(`Server running on port ${PORT}`);
});
