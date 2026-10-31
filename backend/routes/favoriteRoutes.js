const express = require("express");
const router = express.Router();

const {
  addFavorite,
  getFavorites,
  getUserFavorites,
  removeFavorite,
} = require("../controllers/favoriteController");

router.post("/", addFavorite);
router.get("/", getFavorites);
router.get("/user/:userId", getUserFavorites);
router.delete("/:id", removeFavorite);

module.exports = router;