// TiDB Vector Search Migration Script
import pool from './config/database.js';
import fs from 'fs';
import path from 'path';

async function runTiDBVectorMigration() {
  try {
    console.log('🎯 Running TiDB Vector Search migration...');
    
    // Read the TiDB vector migration SQL file
    const migrationSQL = fs.readFileSync(path.join(process.cwd(), 'migrations', 'add_tidb_vector_search.sql'), 'utf8');
    
    // Split SQL statements, filtering out USE statements and comments
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt && 
        !stmt.toUpperCase().startsWith('USE') && 
        !stmt.startsWith('--') &&
        !stmt.startsWith('/*') &&
        stmt !== 'COMMIT'
      );
    
    console.log(`📋 Found ${statements.length} migration statements`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 80)}...`);
          await pool.execute(statement);
          console.log(`✅ Statement ${i + 1} completed successfully`);
        } catch (error) {
          // Continue with other statements if this one fails (e.g., column already exists)
          console.log(`⚠️  Statement ${i + 1} warning: ${error.message}`);
        }
      }
    }
    
    console.log('🎯 TiDB Vector Search migration completed!');
    
    // Verify the migration by checking for vector columns
    console.log('🔍 Verifying vector columns...');
    const [shelterColumns] = await pool.execute("DESCRIBE shelters");
    const vectorColumns = shelterColumns.filter(col => 
      col.Field.includes('embedding') && col.Type.includes('vector')
    );
    
    console.log(`📊 Found ${vectorColumns.length} vector columns in shelters table:`);
    vectorColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });
    
    // Check for vector indexes
    const [indexes] = await pool.execute("SHOW INDEX FROM shelters WHERE Key_name LIKE '%vector%'");
    console.log(`🗂️  Found ${indexes.length} vector indexes`);
    
  } catch (error) {
    console.error('❌ TiDB Vector Migration failed:', error.message);
  } finally {
    process.exit(0);
  }
}

runTiDBVectorMigration();