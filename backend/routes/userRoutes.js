
const express = require("express");

const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// CREATE a user
router.post("/", createUser);

// READ all users
router.get("/", getUsers);

// READ one user
router.get("/:id", getUserById);

// UPDATE a user
router.put("/:id", updateUser);

// DELETE a user
router.delete("/:id", deleteUser);

module.exports = router;
