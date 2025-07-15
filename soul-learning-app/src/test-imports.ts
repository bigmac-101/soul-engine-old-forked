console.log("Test script starting...");

export {}; // Make this file a module

try {
  console.log("Testing @opensouls/core import...");
  const core = await import("@opensouls/core");
  console.log("✓ @opensouls/core imported successfully");
  console.log("Available exports:", Object.keys(core));
} catch (error) {
  console.error(
    "✗ Failed to import @opensouls/core:",
    error instanceof Error ? error.message : String(error)
  );
}

try {
  console.log("\nTesting chalk import...");
  const chalk = await import("chalk");
  console.log("✓ chalk imported successfully");
} catch (error) {
  console.error(
    "✗ Failed to import chalk:",
    error instanceof Error ? error.message : String(error)
  );
}

try {
  console.log("\nTesting local file imports...");
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  console.log("✓ Node.js modules imported successfully");
} catch (error) {
  console.error(
    "✗ Failed to import Node modules:",
    error instanceof Error ? error.message : String(error)
  );
}

console.log("\nTest complete!");
