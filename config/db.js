const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost', // Replace with your host
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'DCES', // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = db;
