const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { UUID_EXPIRY } = require("../configs/serverConfig");

router.get("/generate", async (req, res, next) => {
  // Check if the userId exists
  let userId = req.cookies.userId;

  // If the userId does not exist, generate a new UUID and set it as a cookie
  if (!userId) {
    userId = uuidv4();
    res.cookie("userId", userId, {
      maxAge: UUID_EXPIRY,
    });
  }
  res.json({ userId });
});

module.exports = router;
