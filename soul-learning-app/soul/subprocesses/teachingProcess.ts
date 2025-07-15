/**
 * TEACHING PROCESS - How Scholar shares knowledge
 *
 * This subprocess demonstrates:
 * 1. Adaptive teaching strategies
 * 2. Checking for understanding
 * 3. Using examples and analogies
 * 4. Encouraging questions
 */

import { MentalProcess, useActions, WorkingMemory } from "@opensouls/engine";
import {
  externalDialog,
  internalMonologue,
  decision,
  brainstorm,
  reflect,
} from "../cognitiveSteps/index.js";

interface TeachingParams {
  adaptiveStyle: boolean;
  checkUnderstanding: boolean;
}

/**
 * Teaching Process - Scholar's knowledge sharing mode
 *
 * This process demonstrates how souls can effectively teach and share
 * knowledge while adapting to the learner's needs.
 */
const teachingProcess: MentalProcess<TeachingParams> = async ({
  workingMemory,
  params,
}) => {
  console.log("\n🎓 [TEACHING PROCESS] Initiated");
  console.log(`   Adaptive: ${params?.adaptiveStyle}`);
  console.log(`   Check understanding: ${params?.checkUnderstanding}`);

  const { speak, log } = useActions();
  let memory = workingMemory;

  // Step 1: Assess what to teach
  console.log("\n🤔 [ASSESSMENT] Determining teaching topic...");
  memory = await internalMonologue(memory, {
    instructions:
      "What knowledge would be most valuable to share right now? Consider the conversation context and the user's interests.",
    verb: "considers",
  });

  // Step 2: Brainstorm teaching approaches
  console.log("\n💡 [BRAINSTORM] Generating teaching strategies...");
  const teachingIdeas = await brainstorm(memory, {
    topic: "effective ways to explain this concept",
    count: 3,
    constraints: [
      "Must be engaging",
      "Should include examples",
      "Appropriate complexity level",
    ],
    evaluateFeasibility: true,
  });

  // Step 3: Choose teaching approach
  const approach = await decision(memory, {
    question: "Which teaching approach would be most effective?",
    choices: [
      "storytelling",
      "step_by_step",
      "analogy_based",
      "interactive_questioning",
    ] as const,
    context:
      "Consider the user's apparent learning style and the topic complexity",
  });

  log(`📋 Selected teaching approach: ${approach}`);

  // Step 4: Begin teaching
  console.log("\n👨‍🏫 [TEACHING] Starting instruction...");
  const [teachingMemory, teachingStream] = await externalDialog(memory, {
    instructions: `Begin teaching using the ${approach} approach. Be clear, engaging, and encouraging. Start with an overview of what you'll cover.`,
    stream: true,
  });
  speak(teachingStream);
  memory = teachingMemory;

  // Step 5: Provide the main content
  memory = await internalMonologue(memory, {
    instructions: "Plan the key points to cover in logical sequence",
    verb: "organizes",
  });

  const [contentMemory, contentStream] = await externalDialog(memory, {
    instructions: `Continue teaching with the main content. Use concrete examples and clear explanations. Make it relatable to everyday experiences.`,
    stream: true,
    model: "quality", // Use better model for teaching content
  });
  speak(contentStream);
  memory = contentMemory;

  // Step 6: Check understanding (if enabled)
  if (params?.checkUnderstanding) {
    console.log("\n✅ [CHECK] Verifying comprehension...");

    const [checkMemory, checkStream] = await externalDialog(memory, {
      instructions:
        "Ask a thoughtful question to check if the user understood the key concepts. Make it conversational, not like a test.",
      stream: true,
    });
    speak(checkStream);
    memory = checkMemory;

    // Simulate waiting for response
    console.log(
      "\n⏳ [WAITING] Awaiting user's response to comprehension check..."
    );

    // Process understanding
    memory = await internalMonologue(memory, {
      instructions:
        "Based on the user's response, assess their understanding level and what might need clarification",
      verb: "evaluates",
    });
  }

  // Step 7: Offer additional resources or perspectives
  const offerMore = await decision(memory, {
    question: "Should I offer additional resources or perspectives?",
    choices: [
      "offer_resources",
      "share_perspective",
      "encourage_practice",
      "conclude",
    ] as const,
  });

  if (offerMore !== "conclude") {
    const [resourceMemory, resourceStream] = await externalDialog(memory, {
      instructions:
        offerMore === "offer_resources"
          ? "Suggest helpful resources for deeper learning"
          : offerMore === "share_perspective"
          ? "Share an interesting perspective or application of this knowledge"
          : "Encourage the user to practice or apply what they've learned",
      stream: true,
    });
    speak(resourceStream);
    memory = resourceMemory;
  }

  // Step 8: Reflect on teaching effectiveness
  console.log("\n🪞 [REFLECTION] Evaluating teaching session...");
  memory = await reflect(memory, {
    topic: "How effective was my teaching approach?",
    depth: "moderate",
    focusOn: "learning",
  });

  // Step 9: Closing encouragement
  const [finalMemory, finalStream] = await externalDialog(memory, {
    instructions:
      "Provide warm encouragement and invite any questions. Express joy in sharing knowledge.",
    stream: true,
  });
  speak(finalStream);

  log("🎓 Teaching process complete");
  return finalMemory;
};

export default teachingProcess;
