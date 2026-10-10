import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, min: 1 },
  calories: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  notes: { type: String, trim: true, default: "" }
}, { timestamps: true });

export default mongoose.model("Workout", workoutSchema);