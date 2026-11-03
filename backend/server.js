require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const placeRoutes = require("./routes/placeRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const tripRoutes = require("./routes/tripRoutes");
const hiddenGemRoutes = require("./routes/hiddenGemRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/hidden-gems", hiddenGemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

// Test route
app.get("/", (req, res) => {
  res.send("ExploreX Backend is running!");
});

// Connect database and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ExploreX Backend running on http://localhost:${PORT}`);
  });
};

startServer();
