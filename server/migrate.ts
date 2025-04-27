import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { db } from "./db";

// This script will automatically create tables based on our schema
async function main() {
  console.log("Starting database migration...");
  
  try {
    // This command will create the tables if they don't exist
    await migrate(db, { migrationsFolder: "drizzle" });
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();