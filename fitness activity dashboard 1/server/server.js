import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import workoutRoutes from "./routes/workouts.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/workouts", workoutRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fitness_dashboard";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`API listening at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    console.error("Start MongoDB or set MONGO_URI in server/.env");
    process.exit(1);
  });