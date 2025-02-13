const { DataTypes } = require("sequelize");
const sequelize = require("../Config/dbConnect"); // Import Sequelize instance
const User = require("./User"); // Import User model

const Post = sequelize.define("Post", {
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
  caption: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Post.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

module.exports = Post;
