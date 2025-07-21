// scripts/import-admins.ts

import { db } from '../server/db';
import { admins } from '../shared/schema';
import bcrypt from 'bcryptjs';

// Example admin to create
const defaultAdmins = [
  {
    username: 'admin',
    password: 'admin123', // You should change this after first login
    isModerator: false,
  },
  {
    username: 'mod',
    password: 'mod123',
    isModerator: true,
  },
];

async function run() {
  for (const { username, password, isModerator } of defaultAdmins) {
    const hash = await bcrypt.hash(password, 10);
    try {
      await db.insert(admins).values({
        username,
        passwordHash: hash,
        isModerator,
      });
      console.log(`✅ Created ${isModerator ? 'moderator' : 'admin'}: ${username}`);
    } catch (err) {
      console.error(`⚠️ Failed to create ${username}:`, err);
    }
  }
  process.exit(0);
}

run();
