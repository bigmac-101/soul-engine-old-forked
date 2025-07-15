#!/usr/bin/env node

console.log("=== Minimal OPEN SOULS Test ===\n");

// Test basic execution
console.log("✓ Script is running");

// Test if we can at least use basic Node.js features
try {
  const fs = require("fs");
  const path = require("path");
  console.log("✓ Node.js modules work");

  // Check if soul files exist
  const soulPath = path.join(__dirname, "..", "soul", "Scholar.md");
  if (fs.existsSync(soulPath)) {
    console.log("✓ Soul blueprint file exists");
  } else {
    console.log("✗ Soul blueprint file not found at:", soulPath);
  }
} catch (error) {
  console.error("✗ Basic Node.js error:", error);
}

// Simple interactive test
console.log("\nPress Ctrl+C to exit");
console.log("If you see this message, the basic setup is working!\n");

// Keep the script running
setTimeout(() => {
  console.log("Test completed successfully!");
  process.exit(0);
}, 3000);
