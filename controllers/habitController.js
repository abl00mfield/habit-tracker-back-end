const Habit = require("../models/habit");

const getTodayString = () => newDate().toISOString().split("T")[0];

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const getHabit = async (req, res) => {};
const createHabit = async (req, res) => {};
const updateHabit = async (req, res) => {};
const deleteHabit = async (req, res) => {};
const checkInHabit = async (req, res) => {};
const uncheckHabit = async (req, res) => {};
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
