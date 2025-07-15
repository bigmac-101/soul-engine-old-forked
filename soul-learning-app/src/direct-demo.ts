/**
 * DIRECT SOUL FRAMEWORK DEMONSTRATION
 *
 * This file demonstrates the OPEN SOULS framework components directly,
 * without requiring the full Soul Engine infrastructure. It shows the
 * raw usage of WorkingMemory and cognitive steps.
 */

import { WorkingMemory, ChatMessageRoleEnum } from "@opensouls/core";
import chalk from "chalk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Note: In this direct demo, we'll import the cognitive steps differently
// since they use createCognitiveStep which expects the engine context
// Instead, we'll demonstrate the core concepts

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(chalk.bold.cyan("\n=== OPEN SOULS Direct Framework Demo ===\n"));

/**
 * Demonstrate Working Memory creation and manipulation
 */
async function demonstrateWorkingMemory() {
  console.log(chalk.yellow("\n1. Working Memory Demonstration"));
  console.log(
    chalk.gray(
      "   WorkingMemory is the core data structure for soul cognition\n"
    )
  );

  // Load the soul blueprint
  const blueprint = readFileSync(
    join(__dirname, "..", "soul", "Scholar.md"),
    "utf-8"
  );

  // Create initial working memory
  const initialMemory = new WorkingMemory({
    soulName: "Scholar",
    memories: [
      {
        role: ChatMessageRoleEnum.System,
        content: blueprint,
      },
      {
        role: ChatMessageRoleEnum.System,
        content:
          "You are participating in a demonstration of your cognitive architecture.",
      },
    ],
    processor: {
      name: "openai",
      options: {
        model: "gpt-3.5-turbo",
      },
    },
  });

  console.log(chalk.blue("📊 Initial Working Memory:"));
  console.log(`   Soul Name: ${initialMemory.soulName}`);
  console.log(`   Memory Count: ${initialMemory.memories.length}`);
  console.log(`   Processor: ${initialMemory.processor?.name}`);
  console.log(`   Entity Name: ${initialMemory.entityName}`);

  // Add a user message
  const withUserMessage = initialMemory.withMemory({
    role: ChatMessageRoleEnum.User,
    content: "Hello Scholar! Can you explain how your memory works?",
  });

  console.log(chalk.green("\n✅ After adding user message:"));
  console.log(`   Memory Count: ${withUserMessage.memories.length}`);
  console.log(
    `   Last Memory Role: ${
      withUserMessage.memories[withUserMessage.memories.length - 1].role
    }`
  );

  return withUserMessage;
}

/**
 * Demonstrate cognitive step transformation
 */
async function demonstrateCognitiveTransformation(
  workingMemory: WorkingMemory
) {
  console.log(chalk.yellow("\n2. Cognitive Transformation Demonstration"));
  console.log(
    chalk.gray("   Shows how cognitive steps transform working memory\n")
  );

  // Simulate what a cognitive step does internally
  const transformationCommand = {
    role: ChatMessageRoleEnum.System,
    content: `Model the mind of ${workingMemory.entityName}.
    
    The user asked: "${
      workingMemory.memories[workingMemory.memories.length - 1].content
    }"
    
    Provide a thoughtful response that demonstrates your understanding of your own memory architecture.
    Explain how you process and store information.`,
  };

  console.log(chalk.blue("🧠 Transformation Command:"));
  console.log(
    chalk.gray(transformationCommand.content.substring(0, 200) + "...")
  );

  // Simulate the response
  const simulatedResponse = `I operate through a sophisticated memory architecture called Working Memory. 

Each interaction adds to my memory as an immutable transformation - I don't modify existing memories but create new states. This append-only approach ensures consistency and traceability.

My memories are structured with roles (system, user, assistant) and can include metadata. This allows me to maintain context across our conversation while distinguishing between different types of information.`;

  // Add the response to memory
  const afterResponse = workingMemory.withMemory({
    role: ChatMessageRoleEnum.Assistant,
    content: simulatedResponse,
  });

  console.log(chalk.green("\n✅ After cognitive transformation:"));
  console.log(`   Memory Count: ${afterResponse.memories.length}`);
  console.log(`   Response preview: ${simulatedResponse.substring(0, 100)}...`);

  return afterResponse;
}

/**
 * Demonstrate memory metadata and querying
 */
function demonstrateMemoryFeatures(workingMemory: WorkingMemory) {
  console.log(chalk.yellow("\n3. Memory Features Demonstration"));
  console.log(
    chalk.gray("   Shows metadata, filtering, and memory operations\n")
  );

  // Add memories with metadata
  const withMetadata = workingMemory
    .withMemory({
      role: ChatMessageRoleEnum.Assistant,
      content: "I'm now demonstrating metadata storage.",
      metadata: {
        type: "demonstration",
        timestamp: new Date().toISOString(),
        cognitive_step: "explanation",
        confidence: 0.95,
      },
    })
    .withMemory({
      role: ChatMessageRoleEnum.User,
      content: "How do you use metadata?",
      metadata: {
        type: "question",
        topic: "metadata",
      },
    });

  console.log(chalk.blue("📊 Memory with Metadata:"));

  // Filter memories by metadata
  const questionsOnly = withMetadata.memories.filter(
    (m) => m.metadata?.type === "question"
  );

  console.log(`   Total Memories: ${withMetadata.memories.length}`);
  console.log(`   Questions: ${questionsOnly.length}`);
  console.log(
    `   Last Memory Metadata: ${JSON.stringify(
      withMetadata.memories[withMetadata.memories.length - 2].metadata,
      null,
      2
    )}`
  );

  // Demonstrate memory slicing for context windows
  const recentContext = withMetadata.memories.slice(-5);
  console.log(`\n   Recent Context (last 5): ${recentContext.length} memories`);

  // Calculate token usage (simplified)
  const totalChars = withMetadata.memories.reduce(
    (sum, m) => sum + m.content.length,
    0
  );
  console.log(`   Approximate total characters: ${totalChars}`);

  return withMetadata;
}

/**
 * Demonstrate the concept of cognitive steps
 */
function explainCognitiveSteps() {
  console.log(chalk.yellow("\n4. Cognitive Steps Explanation"));
  console.log(
    chalk.gray("   Understanding the building blocks of soul cognition\n")
  );

  const steps = [
    {
      name: "externalDialog",
      purpose: "Communication with users",
      example: "Speaking, responding, asking questions",
    },
    {
      name: "internalMonologue",
      purpose: "Private thoughts and reasoning",
      example: "Planning, reflecting, considering options",
    },
    {
      name: "decision",
      purpose: "Making structured choices",
      example: "Choosing between predefined options",
    },
    {
      name: "mentalQuery",
      purpose: "Accessing and synthesizing knowledge",
      example: "Recalling information, connecting concepts",
    },
    {
      name: "brainstorm",
      purpose: "Creative idea generation",
      example: "Coming up with novel solutions",
    },
    {
      name: "perceive",
      purpose: "Processing external stimuli",
      example: "Understanding context and environment",
    },
    {
      name: "reflect",
      purpose: "Self-analysis and learning",
      example: "Evaluating past actions and growing",
    },
  ];

  console.log(chalk.blue("🎯 Cognitive Steps Overview:"));
  steps.forEach((step) => {
    console.log(`\n   ${chalk.bold(step.name)}:`);
    console.log(`   Purpose: ${step.purpose}`);
    console.log(`   Example: ${chalk.gray(step.example)}`);
  });

  console.log(chalk.green("\n✨ Key Insight:"));
  console.log("   Each cognitive step is a pure function that transforms");
  console.log("   WorkingMemory → WorkingMemory, building up context");
  console.log("   through immutable transformations.");
}

/**
 * Demonstrate mental processes
 */
function explainMentalProcesses() {
  console.log(chalk.yellow("\n5. Mental Processes Explanation"));
  console.log(chalk.gray("   How souls organize complex thought patterns\n"));

  console.log(chalk.blue("🧩 Mental Process Architecture:"));
  console.log("\n   1. Initial Process (Entry Point)");
  console.log("      ├─→ Awakening & Initialization");
  console.log("      ├─→ Memory Retrieval");
  console.log("      ├─→ Context Assessment");
  console.log("      └─→ Branch to Subprocess");
  console.log("\n   2. Subprocesses (Specialized Modes)");
  console.log("      ├─→ Learning Process");
  console.log("      │   └─→ Question → Listen → Synthesize");
  console.log("      ├─→ Teaching Process");
  console.log("      │   └─→ Assess → Explain → Verify");
  console.log("      └─→ Emotional Process");
  console.log("          └─→ Attune → Support → Affirm");

  console.log(chalk.green("\n✨ Key Insight:"));
  console.log("   Mental processes allow souls to have different");
  console.log("   'modes' of thinking, each optimized for specific");
  console.log("   types of interactions.");
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log(
      chalk.bold("\nThis demo shows the OPEN SOULS framework concepts")
    );
    console.log(chalk.bold("without requiring the full Soul Engine.\n"));

    // Run demonstrations
    const memory1 = await demonstrateWorkingMemory();
    const memory2 = await demonstrateCognitiveTransformation(memory1);
    const memory3 = demonstrateMemoryFeatures(memory2);

    explainCognitiveSteps();
    explainMentalProcesses();

    // Final summary
    console.log(chalk.bold.cyan("\n=== Summary ===\n"));
    console.log("The OPEN SOULS framework provides:");
    console.log(
      "• " + chalk.green("WorkingMemory") + " - Immutable context management"
    );
    console.log(
      "• " + chalk.green("Cognitive Steps") + " - Building blocks of thought"
    );
    console.log(
      "• " + chalk.green("Mental Processes") + " - Complex behavioral patterns"
    );
    console.log(
      "• " +
        chalk.green("Event System") +
        " - Asynchronous soul-world interaction"
    );
    console.log(
      "• " + chalk.green("Streaming") + " - Real-time response generation"
    );

    console.log(
      chalk.gray("\nFor the full interactive experience, run the main")
    );
    console.log(chalk.gray("application with a local Soul Engine instance."));
  } catch (error) {
    console.error(chalk.red("\n❌ Error:"), error.message);
  }
}

// Run the demonstration
main().catch(console.error);
