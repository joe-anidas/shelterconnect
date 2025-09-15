// Migration script to add resolved status
import pool from './config/database.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('Running migration to add resolved status...');
    
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(path.join(process.cwd(), 'migrations', 'add_resolved_status.sql'), 'utf8');
    
    // Split SQL statements (remove USE statement for TiDB)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.toUpperCase().startsWith('USE'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement) {
        console.log('Executing:', statement.substring(0, 100) + '...');
        await pool.execute(statement);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();