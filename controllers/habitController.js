const Habit = require("../models/habit");

const getTodayString = () => new Date().toISOString().split("T")[0];

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const getHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.habitId,
      user: req.user._id,
    });
    if (!habit) {
      return res.status(404).json({ err: "Habit not found" });
    }
    res.json(habit);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const createHabit = async (req, res) => {
  try {
    const { name, frequency, customDays, dailyGoal } = req.body;
    const habit = await Habit.create({
      user: req.user._id,
      name,
      frequency,
      customDays: customDays || [],
      dailyGoal: dailyGoal || 1,
    });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.habitId, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!habit) {
      return res.status(404).json({ err: "Habit not found" });
    }
    res.json(habit);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const deletedHabit = await Habit.findOneAndDelete({
      _id: req.params.habitId,
      user: req.user._id,
    });
    if (!deletedHabit) {
      return res.status(404).json({ err: "Habit not found" });
    }
    res.json({ deletedHabit, msg: "Habit deleted" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const checkInHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.habitId,
      user: req.user._id,
    });
    if (!habit) return res.status(404).json({ err: "Habit not found" });

    const now = new Date();
    const today = getTodayString();

    let todayEntry = habit.history.find((entry) => entry.date === today);
    if (todayEntry) {
      if (todayEntry.checkIns.length >= habit.dailyGoal) {
        return res.status(400).json({ err: "Daily Goal already met" });
      }
      todayEntry.checkIns.push(now);
    } else {
      habit.history.push({
        date: today,
        checkIns: [now],
      });
    }

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const uncheckHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.habitId,
      user: req.user._id,
    });

    if (!habit) return res.status(404).json({ err: "Habit not found" });
    const today = getTodayString();
    const todayEntry = habit.history.find((entry) => entry.date === today);

    if (!todayEntry || todayEntry.checkIns.length === 0) {
      return res.status(400).json({ err: "No check-ins to undo today." });
    }

    todayEntry.checkIns.pop();
    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const getHabitStats = async (req, res) => {};

module.exports = {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  checkInHabit,
  uncheckHabit,
  getHabitStats,
};
