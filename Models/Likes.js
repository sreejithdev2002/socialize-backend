const { DataTypes } = require("sequelize");
const sequelize = require("../Config/dbConnect");
const User = require("./User");
const Post = require("./Post");

const Like = sequelize.define("Like", {
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
});

Like.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Like.belongsTo(Post, { foreignKey: "postId", onDelete: "CASCADE" });

Post.hasMany(Like, { foreignKey: "postId", onDelete: "CASCADE" });

module.exports = Like;
