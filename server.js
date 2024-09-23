const express = require('express');
const cors = require('cors'); // Enables Cross-Origin Resource Sharing
const bodyParser = require('body-parser'); // Parses incoming request bodies
const db = require('./config/db'); // MySQL connection setup
const studentRoutes = require('./routes/studentRoutes'); // Importing the student routes
const authRoutes = require('./routes/auth');
const adminRouter= require('./routes/admin'); // Importing the login/auth routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for frontend/backend communication
app.use(express.json()); // Parse incoming JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data

// Routes
app.use('/api', studentRoutes); // Routes for student-related operations
app.use('/api', authRoutes); // Routes for login/auth operations
app.use('/api', adminRouter);
// Home route for sanity check
app.get('/', (req, res) => {
  res.send('Welcome to the Student QR System API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
