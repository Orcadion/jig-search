const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { username, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

module.exports = router;