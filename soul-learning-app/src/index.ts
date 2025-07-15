/**
 * SOUL LEARNING TERMINAL APP
 *
 * This is a comprehensive demonstration of the OPEN SOULS framework
 * running entirely locally. It shows:
 * 1. Soul initialization and lifecycle
 * 2. Working memory management
 * 3. Cognitive step execution
 * 4. Mental process invocation
 * 5. Real-time streaming
 * 6. Event handling
 * 7. Persistent memory
 *
 * All with extensive logging to understand the inner workings.
 */

import { Soul, WorkingMemory } from "@opensouls/soul";
import { ChatMessageRoleEnum } from "@opensouls/core";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Console logging with colors and formatting
const log = {
  title: (text: string) =>
    console.log(
      chalk.bold.cyan(`\n${"=".repeat(60)}\n${text}\n${"=".repeat(60)}`)
    ),
  section: (text: string) =>
    console.log(chalk.bold.yellow(`\n--- ${text} ---`)),
  info: (text: string) => console.log(chalk.blue(`ℹ️  ${text}`)),
  success: (text: string) => console.log(chalk.green(`✅ ${text}`)),
  error: (text: string) => console.log(chalk.red(`❌ ${text}`)),
  soul: (text: string) => console.log(chalk.magenta(`🤖 ${text}`)),
  user: (text: string) => console.log(chalk.cyan(`👤 ${text}`)),
  memory: (text: string) => console.log(chalk.gray(`💾 ${text}`)),
  process: (text: string) => console.log(chalk.yellow(`⚡ ${text}`)),
};

// Display welcome banner
function displayWelcome() {
  const banner = boxen(
    chalk.bold.cyan("OPEN SOULS Learning Terminal\n") +
      chalk.white("A comprehensive demonstration of AI Souls\n") +
      chalk.gray("Running 100% locally - no cloud required"),
    {
      padding: 1,
      margin: 1,
      borderStyle: "double",
      borderColor: "cyan",
    }
  );
  console.log(banner);
}

// Initialize a soul with extensive logging
async function initializeSoul(): Promise<Soul> {
  log.section("Initializing Soul");

  const spinner = ora("Creating Scholar soul...").start();

  try {
    // Read the soul blueprint
    const blueprintPath = join(__dirname, "..", "soul", "Scholar.md");
    const blueprint = readFileSync(blueprintPath, "utf-8");

    log.info(`Soul blueprint loaded: ${blueprint.length} chars`);

    // Create the soul with local configuration
    const soul = new Soul({
      organization: "local-dev",
      blueprint: "Scholar",
      soulId: `scholar-${Date.now()}`,
      // Use local engine instead of cloud
      engineUrl: "http://localhost:8080",
      debug: true, // Enable debug logging
    });

    // Set up event listeners with logging
    soul.on("error", (error) => {
      log.error(`Soul error: ${error.message}`);
      console.error(error);
    });

    soul.on("connects", () => {
      log.success("Soul connected to local engine");
    });

    soul.on("disconnects", () => {
      log.info("Soul disconnected from engine");
    });

    soul.on("log", (logData) => {
      log.memory(`[Soul Log] ${logData}`);
    });

    soul.on("speakStream", (stream) => {
      log.process("Soul is streaming response...");
    });

    // Connect the soul
    await soul.connect();

    spinner.succeed("Scholar soul initialized and connected!");

    // Log initial soul state
    log.info(`Soul ID: ${soul.soulId}`);
    log.info(`Blueprint: Scholar`);
    log.info(`Debug mode: enabled`);

    return soul;
  } catch (error) {
    spinner.fail("Failed to initialize soul");
    throw error;
  }
}

// Demonstrate working memory operations
async function demonstrateWorkingMemory(soul: Soul) {
  log.section("Working Memory Demonstration");

  // Create initial working memory
  const memories = [
    {
      role: ChatMessageRoleEnum.System,
      content: readFileSync(
        join(__dirname, "..", "soul", "Scholar.md"),
        "utf-8"
      ),
    },
    {
      role: ChatMessageRoleEnum.System,
      content:
        "You are awakening for a demonstration of your cognitive capabilities.",
    },
  ];

  log.info(`Initial memory count: ${memories.length}`);
  log.memory(`System memory 1: ${memories[0].content.substring(0, 100)}...`);
  log.memory(`System memory 2: ${memories[1].content}`);

  // Dispatch initial perception
  log.process("Dispatching initial perception to soul...");

  await soul.dispatch({
    action: "initializes",
    content: "The terminal user wants to learn about how souls work.",
    metadata: {
      timestamp: new Date().toISOString(),
      source: "terminal-app",
    },
  });

  log.success("Initial perception dispatched");
}

// Interactive conversation loop
async function conversationLoop(soul: Soul) {
  log.section("Starting Interactive Conversation");

  log.info("Type 'exit' to end the conversation");
  log.info("Type 'debug' to see current soul state");
  log.info("Type 'memory' to inspect working memory");

  let messageCount = 0;

  while (true) {
    // Get user input
    const { message } = await inquirer.prompt([
      {
        type: "input",
        name: "message",
        message: chalk.cyan("You:"),
        prefix: "👤",
      },
    ]);

    // Handle special commands
    if (message.toLowerCase() === "exit") {
      log.info("Ending conversation...");
      break;
    }

    if (message.toLowerCase() === "debug") {
      log.section("Soul Debug Information");
      log.info(`Messages exchanged: ${messageCount}`);
      log.info(`Soul ID: ${soul.soulId}`);
      log.info(`Connected: ${soul.isConnected}`);
      continue;
    }

    if (message.toLowerCase() === "memory") {
      log.section("Working Memory Inspection");
      // This would show memory state if we had access to it
      log.info("Working memory inspection would show all stored memories");
      continue;
    }

    // Process regular message
    messageCount++;
    log.user(`User message #${messageCount}: ${message}`);

    // Create a loading spinner
    const responseSpinner = ora({
      text: "Scholar is thinking...",
      spinner: "dots",
    }).start();

    try {
      // Dispatch the message to the soul
      log.process(`Dispatching perception with action: "says"`);

      const startTime = Date.now();

      // Set up response handler
      let fullResponse = "";
      let chunkCount = 0;

      soul.on("says", (event) => {
        if (event.stream) {
          responseSpinner.text = `Scholar is responding... (streaming)`;
          // Handle streaming response
          event.stream.on("data", (chunk: string) => {
            chunkCount++;
            fullResponse += chunk;
            process.stdout.write(chalk.magenta(chunk));
          });

          event.stream.on("end", () => {
            const duration = Date.now() - startTime;
            console.log(); // New line after streaming
            responseSpinner.succeed(
              `Response complete (${chunkCount} chunks, ${duration}ms)`
            );
            log.memory(
              `Response stored in working memory: ${fullResponse.length} chars`
            );
          });
        } else if (event.content) {
          // Non-streaming response
          fullResponse = event.content;
          responseSpinner.succeed("Scholar responded");
          log.soul(`Scholar: ${fullResponse}`);
        }
      });

      // Dispatch the user's message
      await soul.dispatch({
        action: "says",
        content: message,
        metadata: {
          timestamp: new Date().toISOString(),
          messageNumber: messageCount,
        },
      });

      // Wait a bit for the response to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      responseSpinner.fail("Error processing message");
      log.error(`Error: ${error.message}`);
    }
  }
}

// Main application flow
async function main() {
  try {
    displayWelcome();

    log.title("OPEN SOULS Framework Demonstration");

    log.info("This demo shows:");
    log.info("• Soul initialization and lifecycle");
    log.info("• Working memory management");
    log.info("• Cognitive step execution");
    log.info("• Mental process invocation");
    log.info("• Real-time streaming responses");
    log.info("• Event-driven architecture");

    // Note about local engine requirement
    log.section("Important: Local Engine Required");
    log.info("This demo requires a local Soul Engine running on port 8080");
    log.info("Run: npm run soul-engine (in another terminal)");

    const { ready } = await inquirer.prompt([
      {
        type: "confirm",
        name: "ready",
        message: "Is your local Soul Engine running?",
        default: true,
      },
    ]);

    if (!ready) {
      log.info("Please start the Soul Engine first:");
      log.info("  cd soul-learning-app");
      log.info("  npm run soul-engine");
      process.exit(0);
    }

    // Initialize the soul
    const soul = await initializeSoul();

    // Demonstrate working memory
    await demonstrateWorkingMemory(soul);

    // Add delay to see initial process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Start conversation loop
    await conversationLoop(soul);

    // Cleanup
    log.section("Shutting down");
    await soul.disconnect();
    log.success("Soul disconnected");
    log.info("Thank you for exploring OPEN SOULS!");
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the application
main().catch(console.error);
