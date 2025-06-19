#!/usr/bin/env tsx

import { storage } from "../server/storage";
import { readFileSync } from "fs";
import { resolve } from "path";

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: npx tsx scripts/import-admins.ts <path-to-txt-file>");
  console.log("Example: npx tsx scripts/import-admins.ts admins.txt");
  console.log("");
  console.log("File format (one admin per line):");
  console.log("username:password:redText(true/false)");
  console.log("Example file content:");
  console.log("john:secret123:false");
  console.log("jane:password456:true");
  console.log("admin:admin123:true");
  process.exit(1);
}

const filePath = resolve(args[0]);

async function importAdmins() {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    let created = 0;
    let errors = 0;
    
    for (const line of lines) {
      const [username, password, redTextStr] = line.split(':');
      
      if (!username || !password) {
        console.log(`Skipping invalid line: ${line}`);
        errors++;
        continue;
      }
      
      const redText = redTextStr === "true";
      
      try {
        const adminUser = await storage.createUser({
          username: username.trim(),
          password: password.trim(),
          isAdmin: true,
          redText,
        });
        
        console.log(`✓ Created admin: ${username} (ID: ${adminUser.id}, Red text: ${redText})`);
        created++;
      } catch (error: any) {
        if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
          console.log(`✗ Username '${username}' already exists`);
        } else {
          console.log(`✗ Error creating '${username}': ${error.message}`);
        }
        errors++;
      }
    }
    
    console.log(`\nSummary: ${created} admins created, ${errors} errors`);
    process.exit(0);
  } catch (error: any) {
    console.error("Error reading file:", error.message);
    process.exit(1);
  }
}

importAdmins();