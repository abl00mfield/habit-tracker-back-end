const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily",
    },
    customDays: [String],
    startDate: { type: Date, default: Date.now },
    dailyGoal: { type: Number, default: 1 },
    history: [
      {
        date: { type: String },
        checkIns: [{ type: Date }], //Timestamps of check-ins
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habit", habitSchema);
