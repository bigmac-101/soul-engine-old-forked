/**
 * STANDALONE DEMO - Works without OPEN SOULS imports
 *
 * This demonstrates the concepts without requiring the framework to be built
 */

import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logger
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
};

// Simulate WorkingMemory
class SimpleWorkingMemory {
  memories: any[] = [];

  constructor(initialMemories: any[]) {
    this.memories = initialMemories;
  }

  addMemory(memory: any) {
    this.memories.push(memory);
    return this;
  }
}

// Simple soul implementation
class StandaloneSoul {
  private memory: SimpleWorkingMemory;
  private blueprint: string;

  constructor() {
    // Load blueprint
    try {
      this.blueprint = readFileSync(
        join(__dirname, "..", "soul", "Scholar.md"),
        "utf-8"
      );
      log.success("Loaded Scholar blueprint");
    } catch (error) {
      log.error("Could not load blueprint, using default");
      this.blueprint = "You are Scholar, a curious and helpful AI assistant.";
    }

    this.memory = new SimpleWorkingMemory([
      { role: "system", content: this.blueprint },
    ]);
  }

  async processMessage(message: string): Promise<string> {
    // Add user message to memory
    this.memory.addMemory({ role: "user", content: message });

    // Simulate thinking
    const responses = [
      "That's a fascinating question! Let me think about that...",
      "I'm curious to explore this topic with you.",
      "From my perspective as Scholar, I find this intriguing.",
      "Let me share my thoughts on this...",
      "That's an excellent point to consider!",
    ];

    // Pick a random response (simulating LLM)
    const response =
      responses[Math.floor(Math.random() * responses.length)] +
      " " +
      "In the OPEN SOULS framework, I would process this through cognitive steps like internal monologue and external dialog. " +
      "My WorkingMemory would transform immutably with each interaction.";

    // Add response to memory
    this.memory.addMemory({ role: "assistant", content: response });

    return response;
  }

  getMemoryCount(): number {
    return this.memory.memories.length;
  }
}

// Main application
async function main() {
  log.title("OPEN SOULS Standalone Demo");

  console.log(chalk.bold("\nThis demo works without framework imports!"));
  console.log(chalk.bold("It simulates the soul interaction experience.\n"));

  const soul = new StandaloneSoul();

  log.section("Starting Conversation");
  log.info("Type 'exit' to quit");
  log.info("Type 'memory' to see memory count");

  while (true) {
    const { message } = await inquirer.prompt([
      {
        type: "input",
        name: "message",
        message: chalk.cyan("You:"),
        prefix: "👤",
      },
    ]);

    if (message.toLowerCase() === "exit") {
      break;
    }

    if (message.toLowerCase() === "memory") {
      log.info(`Memory count: ${soul.getMemoryCount()}`);
      continue;
    }

    const spinner = ora("Scholar is thinking...").start();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await soul.processMessage(message);
    spinner.succeed("Scholar responded");

    log.soul(`Scholar: ${response}`);
  }

  log.success("Thanks for trying the standalone demo!");
}

// Run the application
main().catch(console.error);
