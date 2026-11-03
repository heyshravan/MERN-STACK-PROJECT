require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const placeRoutes = require("./routes/placeRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const tripRoutes = require("./routes/tripRoutes");
const hiddenGemRoutes = require("./routes/hiddenGemRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Production-ready CORS configuration
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// Serve uploaded photographs and 3D GLB models statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API Routes
app.use("/api/users", userRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/hidden-gems", hiddenGemRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.send("ExploreX Backend is running!");
});

// Centralized Error Handling Middleware (prevents stack trace leakage in production)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

const PORT = process.env.PORT || 5000;

// Connect database and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ExploreX Backend running on http://localhost:${PORT}`);
  });
};

startServer();
