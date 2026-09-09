const Post = require("../models/Post");

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { text } = req.body;

    // User must provide either text or image
    if (!text && !req.file) {
      return res.status(400).json({
        message: "Post must contain text, image, or both.",
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const post = await Post.create({
      user: req.user._id,
      text: text || "",
      image,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("user", "username email");

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);

    res.status(500).json({
      message: "Server error while creating post",
    });
  }
};

// GET ALL POSTS
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error);

    res.status(500).json({
      message: "Server error while fetching posts",
    });
  }
};

// LIKE / UNLIKE POST
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const userId = req.user._id;

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username")
      .populate("comments.user", "username");

    res.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Like error:", error);

    res.status(500).json({
      message: "Server error while liking post",
    });
  }
};

// ADD COMMENT
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username")
      .populate("comments.user", "username");

    res.json({
      message: "Comment added successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Comment error:", error);

    res.status(500).json({
      message: "Server error while adding comment",
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  addComment,
};