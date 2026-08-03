import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");
    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).toArray();
    console.log("All Users:", users.map(u => ({ pfNo: u.pfNo, name: u.name, role: u.role, password: u.password })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
