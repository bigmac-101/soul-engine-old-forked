/**
 * LOCAL SOUL RUNNER - Fixed Version
 *
 * This runs souls completely locally using the real OPEN SOULS framework
 * without any cloud services or authentication.
 *
 * This version works around the MentalProcess interface requirements
 * and handles all the real framework interactions locally.
 */

import { WorkingMemory } from "@opensouls/core";
import { ChatMessageRoleEnum } from "@opensouls/core";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { EventEmitter } from "events";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFileSync } from "fs";

// Debug logging to see if script starts
console.log("Starting OPEN SOULS Local Runner...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom logger for soul operations
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

/**
 * Local Soul Runner - Manages soul execution without cloud services
 */
class LocalSoulRunner extends EventEmitter {
  private workingMemory!: WorkingMemory;
  private soulName: string;
  private cognitiveSteps: Map<string, Function> = new Map();
  private isProcessing: boolean = false;
  private soulMemoryStore = new Map<string, any>();

  constructor(soulName: string) {
    super();
    this.soulName = soulName;
    log.info(`Initializing local soul: ${soulName}`);
  }

  /**
   * Initialize the soul from local files
   */
  async initialize() {
    log.section("Loading Soul from Local Files");

    try {
      // Load the soul blueprint
      const soulDir = join(__dirname, "..", "soul");
      const blueprint = readFileSync(
        join(soulDir, `${this.soulName}.md`),
        "utf-8"
      );

      log.info(`Loaded blueprint: ${blueprint.length} characters`);

      // Create initial working memory using the real framework
      this.workingMemory = new WorkingMemory({
        soulName: this.soulName,
        memories: [
          {
            role: ChatMessageRoleEnum.System,
            content: blueprint,
          },
          {
            role: ChatMessageRoleEnum.System,
            content: "You are running locally. Engage naturally with the user.",
          },
        ],
      });

      // Add entityName as an alias for cognitive steps that expect it
      Object.defineProperty(this.workingMemory, "entityName", {
        get() {
          return this.soulName;
        },
        configurable: true,
        enumerable: false,
      });

      log.success(`Soul loaded successfully`);
      log.info(`Initial memories: ${this.workingMemory.memories.length}`);

      // Import and set up cognitive steps
      await this.loadCognitiveSteps();
    } catch (error) {
      log.error(
        `Failed to initialize soul: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  /**
   * Load cognitive steps from the soul directory
   */
  private async loadCognitiveSteps() {
    log.info("Loading cognitive steps...");

    try {
      // Import all cognitive steps
      const steps = await import(
        join(__dirname, "..", "soul", "cognitiveSteps", "index.js")
      );

      // Store references to cognitive steps
      for (const [name, step] of Object.entries(steps)) {
        if (typeof step === "function") {
          this.cognitiveSteps.set(name, step as Function);
          log.info(`  Loaded: ${name}`);
        }
      }

      log.success(`Loaded ${this.cognitiveSteps.size} cognitive steps`);
    } catch (error) {
      log.error(
        `Error loading cognitive steps: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Process a user message through the soul
   */
  async processMessage(message: string) {
    if (this.isProcessing) {
      log.info("Still processing previous message...");
      return;
    }

    this.isProcessing = true;
    log.process("Processing user message");

    try {
      // Add user message to working memory
      this.workingMemory = this.workingMemory.withMemory({
        role: ChatMessageRoleEnum.User,
        content: message,
      });

      // Re-add entityName property after clone
      this.ensureEntityName();

      log.memory(
        `Working memory now has ${this.workingMemory.memories.length} memories`
      );

      // Run the soul's cognitive process
      await this.runCognitiveProcess();
    } catch (error) {
      log.error(
        `Error processing message: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      console.error(error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Ensure entityName property exists on WorkingMemory
   */
  private ensureEntityName() {
    if (!this.workingMemory.hasOwnProperty("entityName")) {
      Object.defineProperty(this.workingMemory, "entityName", {
        get() {
          return this.soulName;
        },
        configurable: true,
        enumerable: false,
      });
    }
  }

  /**
   * Run the soul's cognitive process
   */
  private async runCognitiveProcess() {
    const startTime = Date.now();

    // Simulate the initial process logic
    log.process("Running cognitive process...");

    // Step 1: Internal monologue
    if (this.cognitiveSteps.has("internalMonologue")) {
      log.process("Step 1: Internal reflection");
      const internalMonologue = this.cognitiveSteps.get("internalMonologue")!;

      try {
        const [newMemory, thought] = await internalMonologue(
          this.workingMemory,
          {
            instructions: "Reflect on the user's message and your purpose",
            verb: "contemplates",
          }
        );
        this.workingMemory = newMemory;
        this.ensureEntityName();
      } catch (error) {
        log.error("Error in internal monologue");
      }
    }

    // Step 2: External dialog (response)
    if (this.cognitiveSteps.has("externalDialog")) {
      log.process("Step 2: Generating response");
      const externalDialog = this.cognitiveSteps.get("externalDialog")!;

      try {
        const [newMemory, response] = await externalDialog(this.workingMemory, {
          instructions:
            "Respond thoughtfully to the user, demonstrating your understanding and curiosity",
          stream: false,
        });

        this.workingMemory = newMemory;
        this.ensureEntityName();

        // Emit the response
        this.emit("speaks", { content: response });
      } catch (error) {
        log.error("Error in external dialog");
        // Fallback response
        const fallbackResponse =
          "I apologize, but I'm having trouble formulating a response. Could you please rephrase your message?";
        this.emit("speaks", { content: fallbackResponse });

        this.workingMemory = this.workingMemory.withMemory({
          role: ChatMessageRoleEnum.Assistant,
          content: fallbackResponse,
        });
        this.ensureEntityName();
      }
    }

    const duration = Date.now() - startTime;
    log.success(`Cognitive process completed in ${duration}ms`);
    log.memory(`Final memory count: ${this.workingMemory.memories.length}`);
  }

  /**
   * Get current soul state for debugging
   */
  getState() {
    const lastMemory = this.workingMemory.memories.slice(-1)[0];
    const contentStr =
      typeof lastMemory?.content === "string"
        ? lastMemory.content
        : Array.isArray(lastMemory?.content)
        ? lastMemory.content
            .map((c) => (typeof c === "object" && "text" in c ? c.text : ""))
            .join("")
        : "";

    return {
      soulName: this.soulName,
      memoryCount: this.workingMemory.memories.length,
      isProcessing: this.isProcessing,
      lastMemory: lastMemory
        ? {
            ...lastMemory,
            contentPreview: contentStr.substring(0, 100) + "...",
          }
        : null,
    };
  }
}

/**
 * Interactive conversation loop
 */
async function conversationLoop(soul: LocalSoulRunner) {
  log.section("Starting Conversation");

  log.info("Commands:");
  log.info("  'exit' - End conversation");
  log.info("  'debug' - Show soul state");
  log.info("  'memory' - Show memory details");

  // Handle soul speech events
  soul.on("speaks", (event) => {
    if (event.stream) {
      // Handle streaming response
      process.stdout.write(chalk.magenta("\n🤖 Scholar: "));
      // Note: In real implementation, this would handle async iteration
      console.log(chalk.magenta("[Streaming not implemented in local runner]"));
    } else if (event.content) {
      // Non-streaming response
      log.soul(`Scholar: ${event.content}`);
    }
  });

  let messageCount = 0;

  while (true) {
    const { message } = await inquirer.prompt([
      {
        type: "input",
        name: "message",
        message: chalk.cyan("You:"),
        prefix: "👤",
      },
    ]);

    // Handle commands
    if (message.toLowerCase() === "exit") {
      log.info("Ending conversation...");
      break;
    }

    if (message.toLowerCase() === "debug") {
      log.section("Soul Debug State");
      const state = soul.getState();
      console.log(JSON.stringify(state, null, 2));
      continue;
    }

    if (message.toLowerCase() === "memory") {
      log.section("Memory Details");
      const state = soul.getState();
      log.info(`Total memories: ${state.memoryCount}`);
      if (state.lastMemory) {
        log.info(`Last memory role: ${state.lastMemory.role}`);
        log.info(`Last memory preview: ${state.lastMemory.contentPreview}`);
      }
      continue;
    }

    // Process regular message
    messageCount++;
    log.user(`Message #${messageCount}: ${message}`);

    const spinner = ora({
      text: "Scholar is thinking...",
      spinner: "dots",
    }).start();

    try {
      await soul.processMessage(message);
      spinner.succeed("Response complete");
    } catch (error) {
      spinner.fail("Error processing message");
      log.error(error instanceof Error ? error.message : String(error));
    }
  }
}

/**
 * Main application
 */
async function main() {
  log.title("OPEN SOULS Local Runner");

  console.log(chalk.bold("\nThis runs the REAL soul framework locally"));
  console.log(chalk.bold("No cloud services or authentication required!\n"));

  log.info("Features demonstrated:");
  log.info("• Real WorkingMemory management");
  log.info("• Actual cognitive step execution");
  log.info("• Local processing (no API calls unless configured)");
  log.info("• Event-driven architecture");

  log.section("Important Notes");
  log.info("This runner uses the real OPEN SOULS framework components");
  log.info("Cognitive steps will need API keys configured in .env");
  log.info("Or you can modify them to use local models");

  try {
    // Initialize the soul
    const soul = new LocalSoulRunner("Scholar");
    await soul.initialize();

    // Start conversation
    await conversationLoop(soul);

    log.success("Thank you for exploring OPEN SOULS!");
  } catch (error) {
    log.error(
      `Fatal error: ${error instanceof Error ? error.message : String(error)}`
    );
    console.error(error);
    process.exit(1);
  }
}

// Debug: Show what's being executed
console.log("Script path:", process.argv[1]);
console.log("Checking if should run main...");

// Run the application when executed directly
// Works with both tsx and node
const shouldRun =
  process.argv[1] &&
  (process.argv[1].includes("local-soul-runner-fixed") ||
    process.argv[1].endsWith(".ts"));

if (shouldRun) {
  console.log("Running main function...");
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else {
  console.log("Not running main - script imported as module");
}

export { LocalSoulRunner };
