const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db'); // Adjust the path based on your project structure
const studentRoutes = require('./routes/studentRoutes'); // Adjust the path based on your project structure

const app = express();
app.use(cors()); 
app.use(bodyParser.json()); 

app.use('/api', studentRoutes);


db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
