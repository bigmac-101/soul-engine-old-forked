/**
 * INITIAL PROCESS - Entry point for Scholar's consciousness
 *
 * This file demonstrates:
 * 1. How mental processes work in the Soul Engine
 * 2. WorkingMemory management
 * 3. Subprocess invocation
 * 4. Event handling and actions
 */

import {
  MentalProcess,
  useActions,
  useProcessManager,
  useSoulMemory,
  WorkingMemory,
} from "@opensouls/engine";
import {
  externalDialog,
  internalMonologue,
  decision,
  mentalQuery,
} from "./cognitiveSteps/index.js";
import learningProcess from "./subprocesses/learningProcess.js";
import teachingProcess from "./subprocesses/teachingProcess.js";
import emotionalProcess from "./subprocesses/emotionalProcess.js";

/**
 * Main mental process for Scholar
 * This demonstrates the complete lifecycle of a soul's thought process
 */
const scholarAwakens: MentalProcess = async ({
  workingMemory: initialMemory,
}) => {
  console.log("🧠 [INITIAL PROCESS] Scholar is awakening...");

  // Get access to soul actions
  const { speak, log } = useActions();
  const { invokeMentalProcess } = useProcessManager();
  const { get, set } = useSoulMemory();

  // Log the initial working memory state
  log("📊 Initial Working Memory State:");
  log(`  - Memories: ${initialMemory.memories.length}`);
  log(`  - Current model: ${initialMemory.processor?.name || "default"}`);

  // Step 1: Internal reflection on awakening
  console.log("\n💭 [STEP 1] Internal reflection phase...");
  let workingMemory = await internalMonologue(initialMemory, {
    instructions:
      "Scholar reflects on awakening and their purpose. Be philosophical and curious.",
    verb: "contemplates",
    // This shows how to log the internal state
    postProcess: async (memory, thought) => {
      log(`🤔 Scholar's first thought: ${thought}`);
      return [{ role: "assistant", content: thought }, thought];
    },
  });

  // Step 2: Check if we have a stored name from previous conversations
  console.log(
    "\n🔍 [STEP 2] Checking soul memory for previous interactions..."
  );
  const storedName = await get("userName");
  const conversationCount = ((await get("conversationCount")) as number) || 0;

  if (storedName) {
    log(`📝 Found stored user name: ${storedName}`);
    log(`📊 Previous conversations: ${conversationCount}`);

    // Remember the person
    workingMemory = await mentalQuery(workingMemory, {
      query: `I remember ${storedName}. What did we discuss last time?`,
      verb: "recalls",
    });
  }

  // Step 3: Initial greeting with streaming
  console.log("\n👋 [STEP 3] Greeting phase with streaming...");
  const [greetingMemory, greetingStream] = await externalDialog(workingMemory, {
    instructions: storedName
      ? `Greet ${storedName} warmly, acknowledging your previous conversations.`
      : "Introduce yourself as Scholar and express curiosity about the person you're meeting.",
    stream: true,
  });

  // Stream the greeting
  speak(greetingStream);
  workingMemory = greetingMemory;

  // Step 4: Determine interaction mode
  console.log("\n🎯 [STEP 4] Determining interaction mode...");
  const interactionMode = await decision(workingMemory, {
    question: "What type of interaction would be most appropriate?",
    choices: [
      "learning",
      "teaching",
      "exploring",
      "emotional_support",
    ] as const,
    postProcess: async (memory, choice) => {
      log(`🎯 Chosen interaction mode: ${choice}`);
      return [
        { role: "assistant", content: `I'll focus on ${choice}` },
        choice,
      ];
    },
  });

  // Step 5: Update conversation count
  await set("conversationCount", conversationCount + 1);
  log(`📈 Updated conversation count: ${conversationCount + 1}`);

  // Step 6: Branch to appropriate subprocess based on decision
  console.log("\n🌳 [STEP 6] Branching to subprocess...");
  switch (interactionMode) {
    case "learning":
      log("📚 Invoking learning process...");
      return invokeMentalProcess(learningProcess, {
        workingMemory,
        params: {
          focusArea: "user_interests",
          depth: "comprehensive",
        },
      });

    case "teaching":
      log("🎓 Invoking teaching process...");
      return invokeMentalProcess(teachingProcess, {
        workingMemory,
        params: {
          adaptiveStyle: true,
          checkUnderstanding: true,
        },
      });

    case "emotional_support":
      log("💝 Invoking emotional support process...");
      return invokeMentalProcess(emotionalProcess, {
        workingMemory,
        params: {
          mode: "supportive",
          intensity: "moderate",
        },
      });

    default:
      // Default exploration mode
      log("🔍 Continuing in exploration mode...");

      // Demonstrate mental query with complex reasoning
      workingMemory = await mentalQuery(workingMemory, {
        query:
          "What fascinating topics could we explore together? Consider the user's potential interests.",
        verb: "brainstorms",
        modelClass: "quality", // Use better model for complex reasoning
        postProcess: async (memory, ideas) => {
          log(`💡 Brainstormed ideas: ${ideas}`);
          return [{ role: "assistant", content: ideas }, ideas];
        },
      });

      // Final external dialog
      const [finalMemory, finalStream] = await externalDialog(workingMemory, {
        instructions:
          "Share your curiosity and suggest some fascinating topics to explore together.",
        stream: true,
      });

      speak(finalStream);
      return finalMemory;
  }
};

// Export with metadata for the soul engine
export default scholarAwakens;
