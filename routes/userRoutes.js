const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById } = require("../controllers/userController");
const verifyToken = require("../middleware/verify-token");

router.get("/", verifyToken, getAllUsers);
router.get("/:userId", verifyToken, getUserById);

module.exports = router;
