const { DataTypes } = require("sequelize");
const sequelize = require("../Config/dbConnect");
const User = require("./User");
const Post = require("./Post");

const Comment = sequelize.define("Comment", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: "id",
      },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
  
  // Correctly associate Comment with Post and User
  Comment.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
  Comment.belongsTo(Post, { foreignKey: "postId", onDelete: "CASCADE" });
  
  Post.hasMany(Comment, { foreignKey: "postId", onDelete: "CASCADE" }); // ADD THIS
  
  module.exports = Comment;