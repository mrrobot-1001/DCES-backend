const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db'); // Your MySQL database connection
const router = express.Router();

// Admin Registration Route
router.post('/add-admin', async (req, res) => {
  const { username, password } = req.body;

  // Check if username already exists
  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkQuery, [username], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      // Username already exists
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin into the database
    const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(insertQuery, [username, hashedPassword], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }

      return res.status(201).json({ message: 'Admin added successfully' });
    });
  });
});

module.exports = router;
