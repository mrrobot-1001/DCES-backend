const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your PostgreSQL database connection
const bcrypt = require('bcrypt');

// Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Query to find the user
  const query = 'SELECT * FROM users WHERE username = $1'; // Updated placeholder

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    if (results.rows.length > 0) { // PostgreSQL returns results in 'rows'
      const user = results.rows[0]; // Get the first user object

      // Compare provided password with the stored hashed password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error');
        }

        if (isMatch) {
          // Login successful
          return res.status(200).json({ message: 'Login successful' });
        } else {
          // Invalid password
          return res.status(401).json({ message: 'Invalid username or password' });
        }
      });
    } else {
      // Invalid username
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  });
});

module.exports = router;
