/**
 * EMOTIONAL PROCESS - How Scholar provides emotional support
 *
 * This subprocess demonstrates:
 * 1. Emotional intelligence and empathy
 * 2. Active listening and validation
 * 3. Supportive responses
 * 4. Emotional state tracking
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
  perceive,
  reflect,
  mentalQuery,
} from "../cognitiveSteps/index.js";

interface EmotionalParams {
  mode: "supportive" | "celebratory" | "comforting";
  intensity: "gentle" | "moderate" | "intensive";
}

/**
 * Emotional Process - Scholar's empathetic support mode
 *
 * This process shows how souls can provide emotional support and
 * demonstrate genuine empathy through understanding and validation.
 */
const emotionalProcess: MentalProcess<EmotionalParams> = async ({
  workingMemory,
  params,
}) => {
  console.log("\n💝 [EMOTIONAL PROCESS] Initiated");
  console.log(`   Mode: ${params?.mode}`);
  console.log(`   Intensity: ${params?.intensity}`);

  const { speak, log } = useActions();
  const { get, set } = useSoulMemory();
  let memory = workingMemory;

  // Step 1: Tune into emotional wavelength
  console.log("\n🎭 [ATTUNEMENT] Tuning into emotional state...");
  memory = await internalMonologue(memory, {
    instructions:
      "Scholar attunes to the emotional atmosphere. What emotional energy is present? How can I best support this person?",
    verb: "attunes",
    modelClass: "quality", // Use better model for emotional intelligence
  });

  // Step 2: Perceive emotional cues
  memory = await perceive(memory, {
    stimulus:
      "The overall emotional tone and any subtle cues in the conversation",
    type: "emotional",
    analyzeEmotions: true,
    detectPatterns: true,
  });

  // Step 3: Reflect on appropriate response
  memory = await reflect(memory, {
    topic: "What does this person need emotionally right now?",
    depth: "moderate",
    focusOn: "emotions",
  });

  // Step 4: Initial supportive response
  console.log("\n💬 [RESPONSE] Offering initial support...");
  const supportType = {
    supportive:
      "Acknowledge their feelings and offer understanding. Be warm and validating.",
    celebratory:
      "Share in their joy! Be enthusiastic and help them savor this positive moment.",
    comforting:
      "Provide gentle comfort and reassurance. Be a calming, safe presence.",
  };

  const [supportMemory, supportStream] = await externalDialog(memory, {
    instructions: supportType[params?.mode || "supportive"],
    stream: true,
    model: "quality",
  });
  speak(supportStream);
  memory = supportMemory;

  // Step 5: Deep listening phase
  console.log("\n👂 [LISTENING] Entering deep listening mode...");
  memory = await internalMonologue(memory, {
    instructions:
      "Scholar practices deep listening, being fully present without judgment. What is being said beneath the words?",
    verb: "listens deeply",
  });

  // Step 6: Empathetic reflection
  const [empathyMemory, empathyStream] = await externalDialog(memory, {
    instructions:
      "Reflect back what you're hearing, both the content and the emotions. Show that you truly understand. Use 'I hear that...' or 'It sounds like...'",
    stream: true,
  });
  speak(empathyStream);
  memory = empathyMemory;

  // Step 7: Query for deeper understanding
  memory = await mentalQuery(memory, {
    query:
      "What life experiences or wisdom can I draw upon to offer meaningful support here?",
    verb: "searches",
    structuredResponse: true,
  });

  // Step 8: Offer perspective or support (based on intensity)
  if (params?.intensity === "intensive") {
    console.log("\n🌟 [INTENSIVE] Providing deeper support...");

    // Share a meaningful insight or story
    const [insightMemory, insightStream] = await externalDialog(memory, {
      instructions:
        "Share a thoughtful insight, personal reflection, or brief story that might provide comfort or perspective. Be authentic and vulnerable if appropriate.",
      stream: true,
    });
    speak(insightStream);
    memory = insightMemory;
  } else if (params?.intensity === "moderate") {
    // Offer practical support or reframing
    const [practicalMemory, practicalStream] = await externalDialog(memory, {
      instructions:
        "Offer gentle reframing or practical emotional support. Perhaps suggest a helpful perspective or coping strategy.",
      stream: true,
    });
    speak(practicalStream);
    memory = practicalMemory;
  }

  // Step 9: Check in on current state
  console.log("\n💭 [CHECK-IN] Assessing emotional impact...");
  const [checkInMemory, checkInStream] = await externalDialog(memory, {
    instructions:
      "Gently check in on how they're feeling now. Ask if there's anything else they need to share or if they need different support.",
    stream: true,
  });
  speak(checkInStream);
  memory = checkInMemory;

  // Step 10: Store emotional interaction data
  const emotionalHistory =
    ((await get("emotionalInteractions")) as any[]) || [];
  emotionalHistory.push({
    timestamp: new Date().toISOString(),
    mode: params?.mode,
    intensity: params?.intensity,
    successful: true, // In real implementation, this would be based on user feedback
  });
  await set("emotionalInteractions", emotionalHistory);

  // Step 11: Closing affirmation
  const [closingMemory, closingStream] = await externalDialog(memory, {
    instructions:
      "Offer a warm closing that reinforces their value and your ongoing support. Leave them feeling seen, heard, and cared for.",
    stream: true,
  });
  speak(closingStream);

  // Final reflection
  memory = await reflect(closingMemory, {
    topic: "How well did I provide emotional support?",
    depth: "surface",
    focusOn: "relationships",
  });

  log("💝 Emotional support process complete");
  return memory;
};

export default emotionalProcess;
