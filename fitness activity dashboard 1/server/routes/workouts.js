import express from "express";
import Workout from "../models/Workout.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const workouts = await Workout.find().sort({ date: -1 });
    res.json(workouts);
  } catch {
    res.status(500).json({ message: "Could not fetch workouts." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { type, duration, calories, date, notes } = req.body;
    if (!type?.trim() || !Number.isFinite(Number(duration)) || Number(duration) < 1 ||
        !Number.isFinite(Number(calories)) || Number(calories) < 0 || !date) {
      return res.status(400).json({ message: "Enter a workout type, valid duration, calories, and date." });
    }
    const workout = await Workout.create({
      type: type.trim(), duration: Number(duration), calories: Number(calories),
      date: new Date(date), notes: notes || ""
    });
    res.status(201).json(workout);
  } catch {
    res.status(400).json({ message: "Could not save workout. Check the entered values." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Workout.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Workout not found." });
    res.json({ message: "Workout deleted." });
  } catch {
    res.status(400).json({ message: "Invalid workout ID." });
  }
});

export default router;