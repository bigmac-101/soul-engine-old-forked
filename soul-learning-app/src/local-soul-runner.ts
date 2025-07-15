/**
 * LOCAL SOUL RUNNER
 *
 * This runs souls completely locally using the real OPEN SOULS framework
 * without any cloud services or authentication.
 *
 * This version works around the MentalProcess interface requirements
 * and handles all the real framework interactions locally.
 */

import { ChatMessageRoleEnum, WorkingMemory } from "@opensouls/core";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { EventEmitter } from "events";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";

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
  private memoryFilePath: string;

  constructor(soulName: string) {
    super();
    this.soulName = soulName;
    log.info(`Initializing local soul: ${soulName}`);

    // Set up persistent memory file path
    const memoryDir = join(__dirname, "..", ".soul-memories");
    if (!existsSync(memoryDir)) {
      mkdirSync(memoryDir, { recursive: true });
    }
    this.memoryFilePath = join(
      memoryDir,
      `${soulName.toLowerCase()}-memory.json`
    );

    // Load existing memories from file
    this.loadMemoriesFromFile();
  }

  /**
   * Load memories from persistent storage
   */
  private loadMemoriesFromFile() {
    try {
      if (existsSync(this.memoryFilePath)) {
        const data = readFileSync(this.memoryFilePath, "utf-8");
        const memories = JSON.parse(data);
        Object.entries(memories).forEach(([key, value]) => {
          this.soulMemoryStore.set(key, value);
        });
        log.success(
          `Loaded ${
            Object.keys(memories).length
          } memories from persistent storage`
        );
      } else {
        log.info("No existing memories found, starting fresh");
      }
    } catch (error) {
      log.error(
        `Failed to load memories: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Save memories to persistent storage
   */
  private saveMemoriesToFile() {
    try {
      const memories: Record<string, any> = {};
      this.soulMemoryStore.forEach((value, key) => {
        memories[key] = value;
      });
      writeFileSync(this.memoryFilePath, JSON.stringify(memories, null, 2));
      log.memory(
        `Saved ${Object.keys(memories).length} memories to persistent storage`
      );
    } catch (error) {
      log.error(
        `Failed to save memories: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
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
      const soulName = this.soulName;
      Object.defineProperty(this.workingMemory, "entityName", {
        get() {
          return soulName;
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
      const soulName = this.soulName;
      Object.defineProperty(this.workingMemory, "entityName", {
        get() {
          return soulName;
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
    const { get, set } = this.getSoulMemoryInterface();

    // Simulate the initial process logic
    log.process("Running cognitive process...");

    // Check for stored memories
    const userName = await get("userName");
    const conversationCount = ((await get("conversationCount")) as number) || 0;
    const userFacts = ((await get("userFacts")) as string[]) || [];

    if (userName) {
      log.info(`Remembering user: ${userName}`);
      log.info(`Previous conversations: ${conversationCount}`);
      log.info(`Known facts: ${userFacts.length}`);
    }

    // Step 1: Internal monologue
    if (this.cognitiveSteps.has("internalMonologue")) {
      log.process("Step 1: Internal reflection");
      const internalMonologue = this.cognitiveSteps.get("internalMonologue")!;

      try {
        let instructions = "Reflect on the user's message and your purpose";
        if (userName) {
          instructions += `. Remember, you're talking to ${userName}`;
          if (userFacts.length > 0) {
            instructions += `. You know: ${userFacts.slice(-3).join(", ")}`;
          }
        }

        const [newMemory, thought] = await internalMonologue(
          this.workingMemory,
          {
            instructions,
            verb: "contemplates",
          }
        );
        this.workingMemory = newMemory;
        this.ensureEntityName();

        // Check if we learned the user's name from the message
        const lastUserMessage = this.workingMemory.memories
          .filter((m) => m.role === "user")
          .pop()?.content as string;

        if (!userName && lastUserMessage) {
          const nameMatch = lastUserMessage.match(
            /(?:my name is|i'm|i am|call me)\s+(\w+)/i
          );
          if (nameMatch) {
            const detectedName = nameMatch[1];
            await set("userName", detectedName);
            log.success(`Learned user's name: ${detectedName}`);
          }
        }

        // Check for facts about the user
        if (lastUserMessage) {
          const factPatterns = [
            /i (?:like|love|enjoy|prefer)\s+(.+?)(?:\.|$)/i,
            /my (?:favorite|favourite)\s+(.+?)\s+(?:is|are)\s+(.+?)(?:\.|$)/i,
            /i (?:work|am|do)\s+(?:as|in|at)\s+(.+?)(?:\.|$)/i,
            /i (?:have|own)\s+(.+?)(?:\.|$)/i,
          ];

          for (const pattern of factPatterns) {
            const match = lastUserMessage.match(pattern);
            if (match) {
              const fact = match[0];
              const currentFacts = ((await get("userFacts")) as string[]) || [];
              if (!currentFacts.includes(fact)) {
                currentFacts.push(fact);
                await set("userFacts", currentFacts);
                log.success(`Learned new fact: ${fact}`);
              }
            }
          }
        }
      } catch (error) {
        log.error("Error in internal monologue");
      }
    }

    // Step 2: External dialog (response)
    if (this.cognitiveSteps.has("externalDialog")) {
      log.process("Step 2: Generating response");
      const externalDialog = this.cognitiveSteps.get("externalDialog")!;

      try {
        let instructions =
          "Respond thoughtfully to the user, demonstrating your understanding and curiosity";
        if (userName) {
          instructions += `. Address them as ${userName} when appropriate`;
        }
        if (conversationCount > 0) {
          instructions += `. This is conversation #${
            conversationCount + 1
          } with them`;
        }

        const [newMemory, response] = await externalDialog(this.workingMemory, {
          instructions,
          stream: false,
        });

        this.workingMemory = newMemory;
        this.ensureEntityName();

        // Emit the response
        this.emit("speaks", { content: response });

        // Update conversation count
        await set("conversationCount", conversationCount + 1);

        // Store conversation summary if this is a significant milestone
        if ((conversationCount + 1) % 5 === 0) {
          const summaries =
            ((await get("conversationSummaries")) as any[]) || [];
          summaries.push({
            conversationNumber: conversationCount + 1,
            timestamp: new Date().toISOString(),
            messageCount: this.workingMemory.memories.length,
          });
          await set("conversationSummaries", summaries);
        }
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
            contentPreview: contentStr,
          }
        : null,
    };
  }

  /**
   * Show what the soul remembers about the user
   */
  async showWhatIRemember() {
    const { get } = this.getSoulMemoryInterface();

    log.section("Scholar's Memories About You");

    const userName = await get("userName");
    const conversationCount = ((await get("conversationCount")) as number) || 0;
    const userFacts = ((await get("userFacts")) as string[]) || [];
    const conversationSummaries =
      ((await get("conversationSummaries")) as any[]) || [];
    const userLearnings = ((await get("userLearnings")) as any[]) || [];

    if (userName) {
      log.info(`📝 Your name: ${userName}`);
    } else {
      log.info("📝 I don't know your name yet");
    }

    log.info(`💬 Total conversations: ${conversationCount}`);

    if (userFacts.length > 0) {
      log.info(`📚 Facts I remember about you:`);
      userFacts.forEach((fact, i) => {
        console.log(chalk.gray(`   ${i + 1}. ${fact}`));
      });
    } else {
      log.info("📚 No specific facts remembered yet");
    }

    if (conversationSummaries.length > 0) {
      log.info(`📊 Conversation milestones:`);
      conversationSummaries.forEach((summary) => {
        console.log(
          chalk.gray(
            `   - Conversation #${summary.conversationNumber} on ${new Date(
              summary.timestamp
            ).toLocaleDateString()}`
          )
        );
      });
    }

    if (userLearnings.length > 0) {
      log.info(`🎓 Topics we've explored together:`);
      userLearnings.forEach((learning) => {
        console.log(
          chalk.gray(
            `   - ${learning.topic} (${learning.questionsAsked} questions, ${learning.depth} depth)`
          )
        );
      });
    }
  }

  /**
   * Simulate useSoulMemory hook functionality
   */
  getSoulMemoryInterface() {
    return {
      get: async (key: string) => {
        const value = this.soulMemoryStore.get(key);
        log.memory(
          `Retrieved memory '${key}': ${
            value !== undefined ? JSON.stringify(value) : "undefined"
          }`
        );
        return value;
      },
      set: async (key: string, value: any) => {
        this.soulMemoryStore.set(key, value);
        log.memory(`Stored memory '${key}': ${JSON.stringify(value)}`);
        // Save to file after each set operation
        this.saveMemoriesToFile();
      },
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
  log.info("  'about me' - Show what Scholar remembers about you");

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

    if (message.toLowerCase() === "about me") {
      await soul.showWhatIRemember();
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
  (process.argv[1].includes("local-soul-runner") ||
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
