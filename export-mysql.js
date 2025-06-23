
import { Client } from 'pg';
import fs from 'fs/promises';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_x6urLldJU9Qn@ep-spring-bonus-ad31vd3y.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

const escapeString = (str) => {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
};

const formatValue = (value, type) => {
  if (value === null || value === undefined) return 'NULL';
  
  if (type === 'boolean') {
    return value ? '1' : '0';
  }
  
  if (type === 'timestamp') {
    return escapeString(new Date(value).toISOString().slice(0, 19).replace('T', ' '));
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  return escapeString(value);
};

(async () => {
  await client.connect();
  
  let sql = `-- MySQL Export for DirectAdmin\n`;
  sql += `-- Generated on ${new Date().toISOString()}\n\n`;
  
  sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
  
  // Create tables
  sql += `-- Create threads table\n`;
  sql += `DROP TABLE IF EXISTS threads;\n`;
  sql += `CREATE TABLE threads (\n`;
  sql += `  id INT AUTO_INCREMENT PRIMARY KEY,\n`;
  sql += `  post_number INT NOT NULL,\n`;
  sql += `  subject TEXT,\n`;
  sql += `  content TEXT NOT NULL,\n`;
  sql += `  image_url TEXT,\n`;
  sql += `  image_name TEXT,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  bumped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  reply_count INT DEFAULT 0,\n`;
  sql += `  image_count INT DEFAULT 0,\n`;
  sql += `  name VARCHAR(255) DEFAULT 'Anonymous',\n`;
  sql += `  tripcode VARCHAR(255),\n`;
  sql += `  is_admin_post TINYINT(1) DEFAULT 0,\n`;
  sql += `  ip_address VARCHAR(45)\n`;
  sql += `);\n\n`;

  sql += `-- Create posts table\n`;
  sql += `DROP TABLE IF EXISTS posts;\n`;
  sql += `CREATE TABLE posts (\n`;
  sql += `  id INT AUTO_INCREMENT PRIMARY KEY,\n`;
  sql += `  thread_id INT NOT NULL,\n`;
  sql += `  post_number INT NOT NULL,\n`;
  sql += `  content TEXT NOT NULL,\n`;
  sql += `  image_url TEXT,\n`;
  sql += `  image_name TEXT,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  name VARCHAR(255) DEFAULT 'Anonymous',\n`;
  sql += `  tripcode VARCHAR(255),\n`;
  sql += `  is_admin_post TINYINT(1) DEFAULT 0,\n`;
  sql += `  ip_address VARCHAR(45)\n`;
  sql += `);\n\n`;

  sql += `-- Create users table\n`;
  sql += `DROP TABLE IF EXISTS users;\n`;
  sql += `CREATE TABLE users (\n`;
  sql += `  id INT AUTO_INCREMENT PRIMARY KEY,\n`;
  sql += `  username VARCHAR(50) UNIQUE NOT NULL,\n`;
  sql += `  password TEXT NOT NULL,\n`;
  sql += `  is_admin TINYINT(1) DEFAULT 0,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `-- Create chat_messages table\n`;
  sql += `DROP TABLE IF EXISTS chat_messages;\n`;
  sql += `CREATE TABLE chat_messages (\n`;
  sql += `  id INT AUTO_INCREMENT PRIMARY KEY,\n`;
  sql += `  username VARCHAR(255) NOT NULL,\n`;
  sql += `  message TEXT NOT NULL,\n`;
  sql += `  tripcode VARCHAR(255),\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `-- Create ip_bans table\n`;
  sql += `DROP TABLE IF EXISTS ip_bans;\n`;
  sql += `CREATE TABLE ip_bans (\n`;
  sql += `  id INT AUTO_INCREMENT PRIMARY KEY,\n`;
  sql += `  ip_address VARCHAR(45) UNIQUE NOT NULL,\n`;
  sql += `  reason TEXT,\n`;
  sql += `  banned_by INT,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  expires_at TIMESTAMP NULL\n`;
  sql += `);\n\n`;

  sql += `-- Create sessions table\n`;
  sql += `DROP TABLE IF EXISTS sessions;\n`;
  sql += `CREATE TABLE sessions (\n`;
  sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
  sql += `  user_id INT NOT NULL,\n`;
  sql += `  expires_at TIMESTAMP NOT NULL,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `-- Create thread_pins table\n`;
  sql += `DROP TABLE IF EXISTS thread_pins;\n`;
  sql += `CREATE TABLE thread_pins (\n`;
  sql += `  id INT AUTO_INCREMENT PRIMARY KEY,\n`;
  sql += `  thread_id INT NOT NULL,\n`;
  sql += `  pinned_by INT NOT NULL,\n`;
  sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  // Export data from each table
  const tables = ['threads', 'posts', 'users', 'chat_messages', 'ip_bans', 'sessions', 'thread_pins'];
  
  for (const tableName of tables) {
    try {
      const result = await client.query(`SELECT * FROM ${tableName}`);
      
      if (result.rows.length > 0) {
        sql += `-- Insert data into ${tableName}\n`;
        
        for (const row of result.rows) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            if (col.includes('created_at') || col.includes('bumped_at') || col.includes('expires_at')) {
              return formatValue(row[col], 'timestamp');
            } else if (col.includes('is_admin') || col.includes('is_admin_post')) {
              return formatValue(row[col], 'boolean');
            } else {
              return formatValue(row[col]);
            }
          });
          
          sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sql += '\n';
      }
    } catch (error) {
      console.log(`Table ${tableName} doesn't exist, skipping...`);
    }
  }
  
  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  
  await fs.writeFile('mysql_export.sql', sql);
  await client.end();
  
  console.log('✅ MySQL export created: mysql_export.sql');
  console.log('📝 Upload this file to your DirectAdmin MySQL database');
})();
