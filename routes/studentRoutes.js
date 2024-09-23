const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const QRCode = require('qrcode');

// Get all students
router.get('/students', (req, res) => {
  const query = 'SELECT * FROM students';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ message: 'Server error while fetching students' });
    }
    res.json(results);
  });
});

// Add a student with QR code generation
router.post('/students', async (req, res) => {
  const { name, phone_number, stream } = req.body;  // Capture the stream field in the request
  if (!name || !phone_number || !stream) {
    return res.status(400).json({ message: 'Missing required fields: name, phone number, or stream' });
  }

  try {
    const qrCode = await QRCode.toDataURL(`${name}-${phone_number}-${stream}`); // Include stream in the QR code
    const query = 'INSERT INTO students (name, phone_number, stream, qr_code) VALUES (?, ?, ?, ?)';
    
    db.query(query, [name, phone_number, stream, qrCode], (err, result) => {
      if (err) {
        console.error('Error inserting student:', err);
        return res.status(500).json({ message: 'Server error while adding student' });
      }
      res.json({ message: 'Student added and QR code generated', id: result.insertId });
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({ message: 'Error generating QR code' });
  }
});

// Update QR scan status
router.put('/students/:id/scan', (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE students SET is_scanned = true WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error updating scan status:', err);
      return res.status(500).json({ message: 'Server error while updating scan status' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
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
      console.error('Error fetching student by ID:', err);
      return res.status(500).json({ message: 'Server error while fetching student by ID' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Send student details along with QR code data
    const student = result[0];
    res.json({
      id: student.id,
      name: student.name,
      phone_number: student.phone_number,
      stream: student.stream,   // Include stream in the response
      qr_code: student.qr_code,  // Include the QR code
      is_scanned: student.is_scanned // Include scan status
    });
  });
});

module.exports = router;
