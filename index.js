const express = require("express");
const sequelize = require("./Config/dbConnect");
const cors = require("cors");
const User = require("./Models/User");
const userRouter = require("./Routers/userRouter");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", userRouter)

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

// Sync database
sequelize
  .sync()
  .then(() => console.log("Database connected & models synced"))
  .catch((err) => console.log("Error syncing database:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
