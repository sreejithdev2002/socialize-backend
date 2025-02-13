const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Post = require("../Models/Post");
const Comment = require("../Models/Comments");
const Like = require("../Models/Likes");
require("dotenv").config();

const Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase(); // Normalize email

    // Check if the user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(401).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign({ id: newUser.id, email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User does not exist or Invalid email" });
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const CreatePost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file ? req.file.filename : null;
    const userId = req.user.id; // Get user ID from middleware

    if (!caption) {
      return res.status(400).json({ message: "Caption required" });
    }

    if (!image) {
      return res.status(400).json({ message: "image required" });
    }

    const newPost = await Post.create({
      userId,
      caption,
      imageUrl: `/uploads/${image}`,
    });

    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const GetPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["name"],
        },
        {
          model: Like,
          attributes: ["id"], // We only need the count, not the actual data
        },
        {
          model: Comment,
          attributes: ["id"],
        },
      ],
    });

    // Transform posts data to include likes and comments count
    const postsWithCounts = posts.map((post) => ({
      id: post.id,
      user: post.User,
      caption: post.caption,
      imageUrl: post.imageUrl,
      likes: post.Likes.length, // Count total likes
      comments: post.Comments.length, // Count total comments
    }));

    res.status(200).json({ posts: postsWithCounts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `req.user` contains authenticated user data

    const posts = await Post.findAll({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get posts liked by the user
const getUserLikedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const likedPosts = await Like.findAll({
      where: { userId },
      include: [
        {
          model: Post,
          include: [{ model: User, attributes: ["name"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Extract only post data from likes
    const posts = likedPosts.map((like) => like.Post);

    res.status(200).json({ likedPosts: posts });
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const GetComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.findAll({
      where: { postId },
      include: [{ model: User, attributes: ["name"] }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add a comment to a post
const AddComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id; // Assuming token authentication

    if (!text.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

    const newComment = await Comment.create({
      text,
      postId,
      userId,
    });

    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const LikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id; // Ensure this is retrieved from the authentication middleware

    // Check if the user already liked the post
    const existingLike = await Like.findOne({ where: { postId, userId } });

    if (existingLike) {
      // If like exists, remove it (dislike)
      await Like.destroy({ where: { postId, userId } });

      // Get updated like count
      const likeCount = await Like.count({ where: { postId } });

      return res.status(200).json({ liked: false, likes: likeCount });
    } else {
      // If like doesn't exist, add a new like
      await Like.create({ postId, userId });

      // Get updated like count
      const likeCount = await Like.count({ where: { postId } });

      return res.status(201).json({ liked: true, likes: likeCount });
    }
  } catch (error) {
    console.error("Error in likePost:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  Signup,
  Login,
  CreatePost,
  GetPosts,
  getUserPosts,
  getUserLikedPosts,
  GetComments,
  AddComment,
  LikePost
};
