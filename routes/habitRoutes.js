const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verify-token");
const {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  checkInHabit,
  uncheckHabit,
  getHabitStats,
} = require("../controllers/habitController");

router.use(verifyToken); //all routes below require Auth

router.get("/", getHabits);
router.post("/", createHabit);
router.get("/:habitId", getHabit);
router.put("/:habitId", updateHabit);
router.delete("/:habitId", deleteHabit);
router.patch("/:habitId/check-in", checkInHabit);
router.patch("/:habitId/uncheck", uncheckHabit);
router.get("/:habitId/stats", getHabitStats);

module.exports = router;
