const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your PostgreSQL database connection
const QRCode = require('qrcode');

// Get all students
router.get('/students', (req, res) => {
  const query = 'SELECT * FROM students';
  db.query(query, [], (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ message: 'Server error while fetching students' });
    }
    res.json(results.rows);  // PostgreSQL returns the results in 'rows'
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
    const query = 'INSERT INTO students (name, phone_number, stream, qr_code) VALUES ($1, $2, $3, $4) RETURNING id'; // Updated placeholders
    
    db.query(query, [name, phone_number, stream, qrCode], (err, result) => {
      if (err) {
        console.error('Error inserting student:', err);
        return res.status(500).json({ message: 'Server error while adding student' });
      }
      res.json({ message: 'Student added and QR code generated', id: result.rows[0].id });
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({ message: 'Error generating QR code' });
  }
});

// Update QR scan status
router.post('/scanQR', (req, res) => {
  const { qrCode } = req.body; // Expect the QR code data in the request body

  // Decode QR code data to retrieve student information
  const [name, phone_number, stream] = qrCode.split('-'); // Adjust based on how you generate QR codes

  // Query to check if the student exists based on phone number and stream
  const query = 'SELECT * FROM students WHERE phone_number = $1 AND stream = $2'; // Updated placeholders

  db.query(query, [phone_number, stream], (err, results) => {
    if (err) {
      console.error('Error fetching student:', err);
      return res.status(500).json({ message: 'Server error while fetching student' });
    }
    if (results.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = results.rows[0]; // Access the first row from PostgreSQL results

    // Check if the student has already been scanned
    if (student.is_scanned) {
      return res.status(400).json({ scanned: true, message: 'This QR code has already been scanned' });
    }

    // Update scan status
    const updateQuery = 'UPDATE students SET is_scanned = true WHERE id = $1'; // Updated placeholder

    db.query(updateQuery, [student.id], (updateErr) => {
      if (updateErr) {
        console.error('Error updating scan status:', updateErr);
        return res.status(500).json({ message: 'Server error while updating scan status' });
      }

      // Return success message and update the total scanned count
      res.json({ scanned: false, message: 'QR code scan status updated successfully' });
    });
  });
});

// Get student by ID
router.get('/students/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM students WHERE id = $1'; // Updated placeholder
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching student by ID:', err);
      return res.status(500).json({ message: 'Server error while fetching student by ID' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Send student details along with QR code data
    const student = result.rows[0]; // Access the first row
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

// Delete student by ID
router.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM students WHERE id = $1'; // Updated placeholder

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.status(500).json({ message: 'Server error while deleting student' });
    }
    if (result.rowCount === 0) { // PostgreSQL uses rowCount to check affected rows
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

module.exports = router;
