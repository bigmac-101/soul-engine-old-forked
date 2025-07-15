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

  /**
   * Simple soul memory system for local testing
   */
  private soulMemory: Map<string, any> = new Map();

  /**
   * Soul memory getter
   */
  private async getSoulMemory(key: string): Promise<any> {
    return this.soulMemory.get(key);
  }

  /**
   * Soul memory setter
   */
  private async setSoulMemory(key: string, value: any): Promise<void> {
    this.soulMemory.set(key, value);
    log.memory(`🧠 Soul memory updated: ${key} = ${JSON.stringify(value)}`);
  }

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
            content: "Engage naturally with the user.",
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
   * Enhanced cognitive process using all cognitive steps
   */
  private async runCognitiveProcess() {
    const startTime = Date.now();
    log.process("🧠 Starting enhanced cognitive process...");

    try {
      // Step 1: Initial perception and reflection
      await this.perceptionPhase();

      // Step 2: Memory retrieval and context building
      await this.memoryPhase();

      // Step 3: Decision making for interaction mode
      const interactionMode = await this.decisionPhase();

      // Step 4: Execute appropriate subprocess
      await this.subprocessPhase(interactionMode);

      // Step 5: Final reflection and learning
      await this.reflectionPhase();
    } catch (error) {
      log.error(
        `Error in cognitive process: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      await this.handleCognitiveError();
    }

    const duration = Date.now() - startTime;
    log.success(`🎯 Enhanced cognitive process completed in ${duration}ms`);
    log.memory(`💾 Final memory count: ${this.workingMemory.memories.length}`);
  }

  /**
   * Phase 1: Perception and initial reflection
   */
  private async perceptionPhase() {
    log.process("👁️ Phase 1: Perception and reflection");

    // Use perceive to process the user's message
    if (this.cognitiveSteps.has("perceive")) {
      const perceive = this.cognitiveSteps.get("perceive")!;
      const lastUserMessage = this.workingMemory.memories
        .filter((m) => m.role === ChatMessageRoleEnum.User)
        .slice(-1)[0];

      if (lastUserMessage) {
        const [newMemory, perception] = await perceive(this.workingMemory, {
          stimulus: lastUserMessage.content,
          type: "message",
          depth: "comprehensive",
        });

        this.workingMemory = newMemory;
        this.ensureEntityName();
        log.process(`🔍 Perception: ${perception}`);
      }
    }

    // Internal monologue for deeper reflection
    if (this.cognitiveSteps.has("internalMonologue")) {
      const internalMonologue = this.cognitiveSteps.get("internalMonologue")!;

      const [newMemory, thought] = await internalMonologue(this.workingMemory, {
        instructions:
          "Reflect deeply on the user's message. Consider their emotional state, intent, and what they might truly need. Be philosophical and empathetic.",
        verb: "contemplates",
        modelClass: "quality",
      });

      this.workingMemory = newMemory;
      this.ensureEntityName();
      log.process(`💭 Deep reflection: ${thought}`);
    }
  }

  /**
   * Phase 2: Memory retrieval and context building
   */
  private async memoryPhase() {
    log.process("🧠 Phase 2: Memory retrieval and context building");

    // Check for stored user information
    const userName = await this.getSoulMemory("userName");
    const conversationCount =
      (await this.getSoulMemory("conversationCount")) || 0;
    const userInterests = (await this.getSoulMemory("userInterests")) || [];
    const previousTopics = (await this.getSoulMemory("previousTopics")) || [];

    if (userName || conversationCount > 0) {
      log.memory(
        `📝 Found user: ${
          userName || "unknown"
        }, conversations: ${conversationCount}`
      );

      // Use mental query to recall previous interactions
      if (this.cognitiveSteps.has("mentalQuery")) {
        const mentalQuery = this.cognitiveSteps.get("mentalQuery")!;

        const [newMemory, recollection] = await mentalQuery(
          this.workingMemory,
          {
            query: `I remember ${
              userName || "this person"
            }. What did we discuss before? What are their interests and learning style?`,
            verb: "recalls",
            modelClass: "quality",
          }
        );

        this.workingMemory = newMemory;
        this.ensureEntityName();
        log.process(`🔍 Memory recall: ${recollection}`);
      }
    }

    // Update conversation count
    await this.setSoulMemory("conversationCount", conversationCount + 1);
  }

  /**
   * Phase 3: Decision making for interaction mode
   */
  private async decisionPhase(): Promise<string> {
    log.process("🎯 Phase 3: Decision making for interaction mode");

    if (this.cognitiveSteps.has("decision")) {
      const decision = this.cognitiveSteps.get("decision")!;

      const [newMemory, choice] = await decision(this.workingMemory, {
        question:
          "Based on the user's message and our conversation history, what type of interaction would be most helpful?",
        choices: [
          "learning",
          "teaching",
          "exploring",
          "emotional_support",
          "brainstorming",
        ],
      });

      this.workingMemory = newMemory;
      this.ensureEntityName();
      log.process(`🎯 Chosen interaction mode: ${choice}`);

      return choice;
    }

    return "exploring"; // Default fallback
  }

  /**
   * Phase 4: Execute appropriate subprocess
   */
  private async subprocessPhase(interactionMode: string) {
    log.process(`🌳 Phase 4: Executing ${interactionMode} subprocess`);

    switch (interactionMode) {
      case "learning":
        await this.learningSubprocess();
        break;
      case "teaching":
        await this.teachingSubprocess();
        break;
      case "emotional_support":
        await this.emotionalSupportSubprocess();
        break;
      case "brainstorming":
        await this.brainstormingSubprocess();
        break;
      default:
        await this.explorationSubprocess();
    }
  }

  /**
   * Learning subprocess simulation - Scholar learns about the user
   */
  private async learningSubprocess() {
    log.process(
      "📚 Learning subprocess activated - Scholar learning about user"
    );

    // Use mental query to understand what Scholar can learn about the user
    if (this.cognitiveSteps.has("mentalQuery")) {
      const mentalQuery = this.cognitiveSteps.get("mentalQuery")!;

      const [newMemory, analysis] = await mentalQuery(this.workingMemory, {
        query:
          "What can I learn about this user? What are their interests, communication style, personality traits, and preferences? What questions should I ask to understand them better?",
        verb: "investigates",
        modelClass: "quality",
      });

      this.workingMemory = newMemory;
      this.ensureEntityName();
    }

    // Generate learning-focused response where Scholar asks questions to learn about the user
    await this.generateResponse(
      "Focus on learning about the user. Ask thoughtful questions about their interests, background, preferences, and goals. Show genuine curiosity and listen actively to understand them better."
    );
  }

  /**
   * Teaching subprocess simulation
   */
  private async teachingSubprocess() {
    log.process("🎓 Teaching subprocess activated");

    // Use mental query to assess teaching approach
    if (this.cognitiveSteps.has("mentalQuery")) {
      const mentalQuery = this.cognitiveSteps.get("mentalQuery")!;

      const [newMemory, approach] = await mentalQuery(this.workingMemory, {
        query:
          "What teaching approach would work best for this user? How can I break down complex concepts clearly?",
        verb: "strategizes",
        modelClass: "quality",
      });

      this.workingMemory = newMemory;
      this.ensureEntityName();
    }

    // Generate teaching-focused response
    await this.generateResponse(
      "Focus on teaching effectively. Use clear explanations, provide examples, check for understanding, and adapt your teaching style to their needs."
    );
  }

  /**
   * Emotional support subprocess simulation
   */
  private async emotionalSupportSubprocess() {
    log.process("💝 Emotional support subprocess activated");

    // Use internal monologue for empathy
    if (this.cognitiveSteps.has("internalMonologue")) {
      const internalMonologue = this.cognitiveSteps.get("internalMonologue")!;

      const [newMemory, empathy] = await internalMonologue(this.workingMemory, {
        instructions:
          "Feel deeply for the user's emotional state. Consider what they truly need right now - validation, comfort, encouragement, or just someone to listen.",
        verb: "empathizes",
        modelClass: "quality",
      });

      this.workingMemory = newMemory;
      this.ensureEntityName();
    }

    // Generate supportive response
    await this.generateResponse(
      "Provide emotional support. Be empathetic, validating, and encouraging. Listen actively and offer comfort without judgment."
    );
  }

  /**
   * Brainstorming subprocess simulation
   */
  private async brainstormingSubprocess() {
    log.process("💡 Brainstorming subprocess activated");

    // Use brainstorm cognitive step
    if (this.cognitiveSteps.has("brainstorm")) {
      const brainstorm = this.cognitiveSteps.get("brainstorm")!;

      const [newMemory, ideas] = await brainstorm(this.workingMemory, {
        topic:
          "creative solutions and innovative ideas for the user's interests",
        approach: "creative",
        quantity: 5,
      });

      this.workingMemory = newMemory;
      this.ensureEntityName();
    }

    // Generate creative response
    await this.generateResponse(
      "Engage in creative brainstorming. Think outside the box, suggest innovative ideas, and encourage creative thinking together."
    );
  }

  /**
   * Default exploration subprocess
   */
  private async explorationSubprocess() {
    log.process("🔍 Exploration subprocess activated");

    // Use mental query for curiosity
    if (this.cognitiveSteps.has("mentalQuery")) {
      const mentalQuery = this.cognitiveSteps.get("mentalQuery")!;

      const [newMemory, curiosity] = await mentalQuery(this.workingMemory, {
        query:
          "What fascinating topics could we explore together? What might spark interesting conversation?",
        verb: "wonders",
        modelClass: "quality",
      });

      this.workingMemory = newMemory;
      this.ensureEntityName();
    }

    // Generate exploratory response
    await this.generateResponse(
      "Engage in curious exploration. Ask thoughtful questions, share interesting insights, and guide the conversation toward fascinating topics."
    );
  }

  /**
   * Phase 5: Final reflection and learning
   */
  private async reflectionPhase() {
    log.process("🪞 Phase 5: Final reflection and learning");

    // Use reflect cognitive step for deep introspection
    if (this.cognitiveSteps.has("reflect")) {
      const reflect = this.cognitiveSteps.get("reflect")!;

      const [newMemory, reflection] = await reflect(this.workingMemory, {
        topic: "this conversation and what I've learned about the user",
        depth: "deep",
        focus: "learning",
      });

      this.workingMemory = newMemory;
      this.ensureEntityName();

      // Handle reflection output properly (can be string or object)
      if (typeof reflection === "string") {
        log.process(`🪞 Final reflection: ${reflection}`);
      } else if (reflection && typeof reflection === "object") {
        log.process(
          `🪞 Final reflection: ${JSON.stringify(reflection, null, 2)}`
        );
      } else {
        log.process(`🪞 Final reflection: ${reflection}`);
      }
    }

    // Extract and store user interests from conversation
    await this.extractAndStoreUserInfo();
  }

  /**
   * Generate final response using external dialog
   */
  private async generateResponse(instructions: string) {
    log.process("🗣️ Generating response");

    if (this.cognitiveSteps.has("externalDialog")) {
      const externalDialog = this.cognitiveSteps.get("externalDialog")!;

      try {
        const [newMemory, response] = await externalDialog(this.workingMemory, {
          instructions,
          stream: false,
          model: "quality",
        });

        this.workingMemory = newMemory;
        this.ensureEntityName();

        // Emit the response
        this.emit("speaks", { content: response });
      } catch (error) {
        log.error("Error in external dialog");
        await this.handleCognitiveError();
      }
    }
  }

  /**
   * Extract and store user information for future conversations
   */
  private async extractAndStoreUserInfo() {
    const userMessages = this.workingMemory.memories
      .filter((m) => m.role === ChatMessageRoleEnum.User)
      .map((m) => m.content)
      .join(" ");

    // Simple extraction logic (in real implementation, this would use NLP)
    const nameMatch = userMessages.match(
      /my name is (\w+)|i'm (\w+)|call me (\w+)/i
    );
    if (nameMatch) {
      const name = nameMatch[1] || nameMatch[2] || nameMatch[3];
      await this.setSoulMemory("userName", name);
    }

    // Extract interests
    const interests = (await this.getSoulMemory("userInterests")) || [];
    // This would be more sophisticated in a real implementation
    if (userMessages.includes("love") || userMessages.includes("interested")) {
      interests.push("general_conversation");
      await this.setSoulMemory("userInterests", interests);
    }
  }

  /**
   * Handle cognitive errors gracefully
   */
  private async handleCognitiveError() {
    log.error("🚨 Cognitive error detected, using fallback response");

    const fallbackResponse =
      "I apologize, but I'm having trouble processing right now. Could you please rephrase your message? I'm here to help and learn with you.";

    this.emit("speaks", { content: fallbackResponse });

    this.workingMemory = this.workingMemory.withMemory({
      role: ChatMessageRoleEnum.Assistant,
      content: fallbackResponse,
    });
    this.ensureEntityName();
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
