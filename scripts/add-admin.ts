#!/usr/bin/env tsx

import { storage } from "../server/storage";

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: npx tsx scripts/add-admin.ts <username> <password> [redText]");
  console.log("Example: npx tsx scripts/add-admin.ts john secret123");
  console.log("Example: npx tsx scripts/add-admin.ts jane password456 true");
  process.exit(1);
}

const [username, password, redTextStr] = args;
const redText = redTextStr === "true";

async function addAdmin() {
  try {
    const adminUser = await storage.createUser({
      username,
      password,
      isAdmin: true,
      redText,
    });
    
    console.log("Admin user created successfully!");
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Red text enabled:", redText);
    console.log("User ID:", adminUser.id);
    
    process.exit(0);
  } catch (error: any) {
    if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
      console.error("Error: Username already exists!");
    } else {
      console.error("Error creating admin user:", error.message);
    }
    process.exit(1);
  }
}

addAdmin();