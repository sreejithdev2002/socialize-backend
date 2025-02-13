const express = require("express");
const {
  Signup,
  Login,
  CreatePost,
  GetPosts,
  getUserPosts,
  getUserLikedPosts,
  GetComments,
  AddComment,
  LikePost,
  checkLikeStatus,
  GetUserDetails,
} = require("../Controllers/userController");
const authMiddleware = require("../Middleware/authMiddleware");
const upload = require("../Middleware/upload");

const router = express.Router();

// POST METHODS

router.post("/createAccount", Signup);
router.post("/login", Login);
router.post("/createPost", authMiddleware, upload.single("image"), CreatePost);
router.post("/:postId", authMiddleware, AddComment);
router.post("/:postId/like", authMiddleware, LikePost);

// GET METHODS

router.get("/getPosts", authMiddleware, GetPosts);
router.get("/userPosts", authMiddleware, getUserPosts);
router.get("/userLikedPosts", authMiddleware, getUserLikedPosts);
router.get("/:postId", GetComments);
router.get("/like-status/:postId", authMiddleware, checkLikeStatus);
router.get("/userdetails/:email", authMiddleware, GetUserDetails);

module.exports = router;
