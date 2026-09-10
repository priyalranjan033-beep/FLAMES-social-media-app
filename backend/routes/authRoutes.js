const express = require("express");

const {
  signup,
  login,
  getCurrentUser,
  logout,
} = require("../controllers/authController");

const router = express.Router();

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

// Get currently logged-in user
router.get("/me", getCurrentUser);

// Logout
router.post("/logout", logout);

module.exports = router;