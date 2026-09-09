const express = require("express");
const multer = require("multer");

const protect = require("../middleware/authMiddleware");

const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} = require("../controllers/postController");

const router = express.Router();

// Image upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
});

// Public feed
router.get("/", getPosts);

// Create post
router.post("/", protect, upload.single("image"), createPost);

// Like / unlike
router.post("/:id/like", protect, toggleLike);

// Comment
router.post("/:id/comments", protect, addComment);

module.exports = router;