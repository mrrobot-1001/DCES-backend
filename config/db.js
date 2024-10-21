const { Pool } = require('pg');

// Configure PostgreSQL connection using provided credentials
const pool = new Pool({
  host: 'dpg-csb73o88fa8c73clmd60-a.oregon-postgres.render.com',
  user: 'dcesmain_user',
  password: 'qJJBbXHu9Yuekt8yUP7KSnv9gdXA7AA4',
  database: 'dcesmain',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,  // Required for Render's external database connections
  },
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
