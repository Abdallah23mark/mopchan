#!/usr/bin/env tsx

import { storage } from "../server/storage";

async function createAdmin() {
  try {
    const adminUser = await storage.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true,
      redText: true,
    });
    
    console.log("Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("User ID:", adminUser.id);
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();