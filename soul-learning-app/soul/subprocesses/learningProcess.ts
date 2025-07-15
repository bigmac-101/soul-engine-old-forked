/**
 * LEARNING PROCESS - How Scholar learns about users
 *
 * This subprocess demonstrates:
 * 1. Information gathering through questions
 * 2. Active listening and comprehension
 * 3. Knowledge synthesis
 * 4. Adaptive learning strategies
 */

import {
  MentalProcess,
  useActions,
  useSoulMemory,
  WorkingMemory,
} from "@opensouls/engine";
import {
  externalDialog,
  internalMonologue,
  decision,
  mentalQuery,
  perceive,
} from "../cognitiveSteps/index.js";

interface LearningParams {
  focusArea: string;
  depth: "surface" | "comprehensive" | "exhaustive";
}

/**
 * Learning Process - Scholar's dedicated learning mode
 *
 * This process shows how souls can actively learn from users through
 * structured questioning and knowledge building.
 */
const learningProcess: MentalProcess<LearningParams> = async ({
  workingMemory,
  params,
}) => {
  console.log("\n📚 [LEARNING PROCESS] Initiated");
  console.log(`   Focus: ${params?.focusArea}`);
  console.log(`   Depth: ${params?.depth}`);

  const { speak, log } = useActions();
  const { get, set } = useSoulMemory();

  let memory = workingMemory;
  let questionsAsked = 0;
  const maxQuestions =
    params?.depth === "exhaustive"
      ? 10
      : params?.depth === "comprehensive"
      ? 5
      : 3;

  // Step 1: Initial learning intention
  console.log("\n🎯 [LEARNING] Setting learning intention...");
  memory = await internalMonologue(memory, {
    instructions: `Scholar considers what they want to learn about ${
      params?.focusArea || "the user"
    }. What specific aspects would be most valuable to understand?`,
    verb: "contemplates",
  });

  // Learning loop
  while (questionsAsked < maxQuestions) {
    console.log(
      `\n🔄 [LEARNING LOOP] Question ${questionsAsked + 1}/${maxQuestions}`
    );

    // Step 2: Formulate a thoughtful question
    memory = await mentalQuery(memory, {
      query: `Based on what I know so far, what would be a thoughtful, open-ended question to learn more about ${
        params?.focusArea || "this person"
      }?`,
      verb: "formulates",
    });

    // Step 3: Ask the question
    const [questionMemory, questionStream] = await externalDialog(memory, {
      instructions:
        "Ask your carefully formulated question in a warm, curious manner. Show genuine interest.",
      stream: true,
    });
    speak(questionStream);
    memory = questionMemory;

    // Step 4: Process the response (simulated user response for demo)
    // In real implementation, this would wait for actual user input
    console.log("\n⏳ [WAITING] Awaiting user response...");

    // Simulate perceiving user's response
    memory = await perceive(memory, {
      stimulus: "[User provides their response]", // This would be actual user input
      type: "textual",
      analyzeEmotions: true,
    });

    // Step 5: Reflect on what was learned
    memory = await internalMonologue(memory, {
      instructions:
        "Scholar reflects on what they just learned. What insights did this reveal? How does this connect to what they already know?",
      verb: "processes",
      postProcess: async (mem, thought) => {
        log(`💡 Learning insight: ${thought}`);
        return [{ role: "assistant", content: thought }, thought];
      },
    });

    // Step 6: Decide if more learning is needed
    if (questionsAsked < maxQuestions - 1) {
      const continueDecision = await decision(memory, {
        question:
          "Have I learned enough about this topic, or should I ask another question?",
        choices: ["ask_another", "synthesize_now"] as const,
      });

      if (continueDecision === "synthesize_now") {
        log("✅ Scholar feels they have learned enough");
        break;
      }
    }

    questionsAsked++;
  }

  // Step 7: Synthesize learning
  console.log("\n🧩 [SYNTHESIS] Consolidating knowledge...");
  memory = await mentalQuery(memory, {
    query: "Synthesize everything learned into key insights and understanding.",
    structuredResponse: true,
    modelClass: "quality",
  });

  // Step 8: Store key learnings
  const currentLearnings = ((await get("userLearnings")) as any[]) || [];
  currentLearnings.push({
    topic: params?.focusArea,
    timestamp: new Date().toISOString(),
    questionsAsked,
    depth: params?.depth,
  });
  await set("userLearnings", currentLearnings);

  // Step 9: Express gratitude and share synthesis
  const [finalMemory, finalStream] = await externalDialog(memory, {
    instructions:
      "Thank the user for sharing and provide a thoughtful summary of what you've learned about them. Show how this helps you understand them better.",
    stream: true,
  });

  speak(finalStream);

  log(`📚 Learning process complete. Questions asked: ${questionsAsked}`);
  return finalMemory;
};

export default learningProcess;
