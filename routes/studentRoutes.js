const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const QRCode = require('qrcode');




router.get('/students', (req, res) => {
  const query = 'SELECT * FROM students';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});


router.post('/students', async (req, res) => {
  const { name, phone_number } = req.body;
  try {

    const qrCode = await QRCode.toDataURL(`${name}-${phone_number}`);
    const query = 'INSERT INTO students (name, phone_number, qr_code) VALUES (?, ?, ?)';
    db.query(query, [name, phone_number, qrCode], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }
      res.json({ message: 'Student added and QR code generated', id: result.insertId });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error generating QR code');
  }
});

// Update QR scan status
router.put('/students/:id/scan', (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE students SET is_scanned = true WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Student not found');
    }
    res.json({ message: 'QR code scan status updated' });
  });
});

// Get student by ID
router.get('/students/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM students WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    if (result.length === 0) {
      return res.status(404).send('Student not found');
    }
    // Send student details along with QR code data
    const student = result[0];
    res.json({
      id: student.id,
      name: student.name,
      phone_number: student.phone_number,
      qr_code: student.qr_code,  // Include the QR code
      is_scanned: student.is_scanned // Include scan status if needed
    });
  });
});

module.exports = router;
