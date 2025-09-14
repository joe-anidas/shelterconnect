//config/database.js
import mysql from 'mysql2/promise';
import config from './env.js';

const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port,
  ssl: { rejectUnauthorized: false }, // TiDB Serverless uses self-signed certificates
  connectionLimit: 10,
  acquireTimeout: 60000,
  idleTimeout: 60000,
  queueLimit: 0,
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message);
    if (config.enableMockData) {
      console.log('🔧 Mock data mode enabled - continuing without database');
    }
  });

export default pool;