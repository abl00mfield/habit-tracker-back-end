const { DateTime } = require("luxon");

const Habit = require("../models/habit");

const getTodayString = (timezone = "UTC") => {
  return DateTime.now().setZone(timezone).toISODate(); //YYYY-MM-DD
};

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
    const {
      name,
      frequency,
      customDays,
      startDate,
      timezone,
      dailyGoal,
      history,
    } = req.body;
    const startDateObj = startDate
      ? new Date(startDate)
      : DateTime.now()
          .setZone(timezone || "UTC")
          .toJSDate();

    const habit = await Habit.create({
      user: req.user._id,
      name,
      frequency,
      history: history || [],
      customDays: customDays || [],
      dailyGoal: dailyGoal || 1,
      startDate: startDateObj,
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

    const timezone = req.body.timezone || "UTC";
    const now = DateTime.now().setZone(timezone).toJSDate(); //timestamp in local time
    const today = getTodayString(timezone);

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

    const timezone = req.body.timezone || "UTC";
    const today = getTodayString(timezone);
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

const getHabitStats = async (req, res) => {
  try {
    //fetch the habit, ensuring the logged-in user owns it
    const habit = await Habit.findOne({
      _id: req.params.habitId,
      user: req.user._id,
    });

    if (!habit) return res.status(404).json({ err: "Habit not found" });

    const timezone = req.query.timezone || "UTC";
    const today = getTodayString(timezone);

    //build a set of all dates where the habit was sucessfully completed
    const dateSet = new Set(
      habit.history
        .filter((h) => h.checkIns.length >= habit.dailyGoal)
        .map((h) => h.date)
    );

    //calculate current streak and longest streak
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;

    //start at one year ago and loop through each day up to today

    const start = DateTime.fromISO(today).minus({ days: 365 });

    for (let i = 0; i <= 365; i++) {
      const dayStr = start.plus({ days: i }).toISODate();
      if (dateSet.has(dayStr)) {
        streak++;
        if (streak > longestStreak) longestStreak = streak;
        //save current streak if we are at today
        if (dayStr === today) currentStreak = streak;
      } else {
        if (dayStr === today) currentStreak = 0;
        streak = 0;
      }
    }

    //calculate completion rate
    const startDate = DateTime.fromJSDate(habit.startDate).startOf("day");
    const now = DateTime.now().setZone(timezone).startOf("day");

    const totalDays = Math.max(
      1,
      Math.floor(now.diff(startDate, "days").days) + 1
    );

    const completedDays = habit.history.filter(
      (entry) => entry.checkIns.length >= habit.dailyGoal
    ).length;

    const completionRate = Math.round((completedDays / totalDays) * 100);

    //progress for today
    const todayEntry = habit.history.find((h) => h.date === today);
    const todayProgress = todayEntry ? todayEntry.checkIns.length : 0;

    //respond with full stats object
    res.json({
      habitId: habit._id,
      name: habit.name,
      dailyGoal: habit.dailyGoal,
      currentStreak,
      longestStreak,
      completionRate,
      todayProgress,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

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
