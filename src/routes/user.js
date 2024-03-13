const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { UUID_EXPIRY } = require('../configs/serverConfig');

router.get('/generate', async (req, res, next) => {
  // Check if the userId exists
  let userId = req.cookies.userId;

  // If the userId does not exist, generate a new UUID and set it as a cookie
  if (!userId) {
    userId = uuidv4();
    res.cookie('userId', userId, {
      maxAge: UUID_EXPIRY,
    });
  }
  res.json({ userId });
});

/**
 *
 * If the token doesn't contain 'userId', then it is a user,
 * otherwise its the owner
 */
router.get('/fetchRole', async (req, res, next) => {
  const SECRET_KEY = process.env.SECRET_KEY;
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  // Check the userRole from token
  jwt.verify(accessToken, SECRET_KEY, async (err, payload) => {
    if (err) {
      return res.status(401).json({ error: 'Token has expired' });
    }

    if (!payload.userId) {
      return res.status(200).json({ userRole: 'user' });
    }

    return res.status(200).json({ userRole: 'owner' });
  });
});

module.exports = router;
