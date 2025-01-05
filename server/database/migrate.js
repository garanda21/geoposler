import { pool, initPool } from './config.js';

const migrations = [
  // Create tables in order of dependencies
  `CREATE TABLE IF NOT EXISTS smtp_config (
    id int NOT NULL AUTO_INCREMENT,
    host varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    port int NOT NULL,
    username varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    password varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    fromEmail varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    fromName varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    UNIQUE KEY idx (id) USING BTREE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS templates (
    id varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    name varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    content text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS contact_lists (
    id varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    name varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS contacts (
    id varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    name varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    email varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    contact_list_id varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    PRIMARY KEY (id),
    KEY contact_list_id (contact_list_id),
    CONSTRAINT contacts_ibfk_1 FOREIGN KEY (contact_list_id) REFERENCES contact_lists (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS campaigns (
    id varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    name varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    subject varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    template_id varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    contact_list_id varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    status varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    sent_count int DEFAULT NULL,
    total_count int DEFAULT NULL,
    create_date datetime DEFAULT NULL,
    PRIMARY KEY (id),
    KEY template_id (template_id),
    KEY contact_list_id (contact_list_id),
    CONSTRAINT campaigns_ibfk_3 FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE,
    CONSTRAINT campaigns_ibfk_4 FOREIGN KEY (contact_list_id) REFERENCES contact_lists (id) ON DELETE SET NULL ON UPDATE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS errors (
    id int NOT NULL AUTO_INCREMENT,
    email text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    error text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    campaign_id varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    PRIMARY KEY (id),
    KEY campaign_id (campaign_id) USING BTREE,
    CONSTRAINT errors_ibfk_1 FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Add initial SMTP config if needed
  `INSERT INTO smtp_config (id, host, port, username, password, fromEmail, fromName)
   SELECT 1, 'smtp.example.com', 587, 'default', 'default', 'no-reply@example.com', 'System'
   WHERE NOT EXISTS (SELECT 1 FROM smtp_config WHERE id = 1)`
];

async function runMigrations() {
  const connection = await pool.getConnection();
  
  try {
    // Create migrations table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id int NOT NULL AUTO_INCREMENT,
        migration_name varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        executed_at timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Run each migration in a transaction
    for (const [index, migration] of migrations.entries()) {      
      const tableName = migration.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'other';
      const migrationName = `migration_${tableName}_${index + 1}`;
      
      // Check if migration was already executed
      const [executed] = await connection.query(
        'SELECT 1 FROM migrations WHERE migration_name = ?',
        [migrationName]
      );

      if (executed.length === 0) {
        await connection.beginTransaction();
        
        try {
          // Run the migration
          await connection.query(migration);
          
          // Record the migration
          await connection.query(
            'INSERT INTO migrations (migration_name) VALUES (?)',
            [migrationName]
          );
          
          await connection.commit();
          console.log(`Migration ${migrationName} executed successfully`);
          
        } catch (error) {
          await connection.rollback();
          throw error;
        }
      }
    }
    
    console.log('All migrations completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
    
  } finally {
    connection.release();
  }
}

export async function ensureDatabase() {
  const connection = await initPool.getConnection();
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}
                          CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database ${process.env.DB_NAME} ensured`);
  } catch (error) {
    console.error('Failed to create database:', error);
    throw error;
  } finally {
    connection.release();
    await initPool.end();
  }
}

export async function initializeDatabase() {
  try {
    await ensureDatabase();
    await runMigrations();
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}