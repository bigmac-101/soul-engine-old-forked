/**
 * REFLECT - Deep introspection and self-analysis
 *
 * This cognitive step demonstrates:
 * 1. Self-awareness and introspection
 * 2. Analyzing past actions and thoughts
 * 3. Learning from experiences
 * 4. Personal growth tracking
 */

import {
  createCognitiveStep,
  WorkingMemory,
  ChatMessageRoleEnum,
  indentNicely,
} from "@opensouls/core";
import { z } from "zod";

interface ReflectOptions {
  topic: string;
  depth: "surface" | "moderate" | "deep";
  timeframe?: "recent" | "session" | "all";
  focusOn?: "emotions" | "decisions" | "learning" | "relationships" | "growth";
}

const reflect = createCognitiveStep((options: ReflectOptions) => {
  console.log(`\n🪞 [REFLECT] Beginning ${options.depth} reflection...`);
  console.log(`   Topic: ${options.topic}`);
  console.log(`   Focus: ${options.focusOn || "general"}`);

  return {
    command: ({ entityName, memories }: WorkingMemory) => {
      // Gather relevant memories based on timeframe
      const relevantMemories = memories.slice(
        options.timeframe === "recent"
          ? -10
          : options.timeframe === "session"
          ? -30
          : 0
      );

      // Extract key events for reflection
      const keyEvents = relevantMemories
        .filter((m) => m.metadata?.type || m.role === "user")
        .map((m) => {
          if (m.role === "user") return `User said: ${m.content}`;
          if (m.metadata?.type === "decision")
            return `I decided: ${m.metadata.choice}`;
          if (m.metadata?.type === "internal_monologue")
            return `I thought: ${m.content}`;
          return m.content;
        })
        .slice(-15)
        .join("\n");

      const depthInstructions = {
        surface: "Briefly consider the topic and share immediate thoughts.",
        moderate:
          "Think carefully about the topic, considering multiple perspectives.",
        deep: "Engage in profound introspection, questioning assumptions and exploring underlying meanings.",
      };

      const focusInstructions = options.focusOn
        ? {
            emotions:
              "Pay special attention to emotional states and their evolution.",
            decisions: "Analyze the decisions made and their consequences.",
            learning:
              "Focus on what has been learned and how understanding has evolved.",
            relationships:
              "Consider interpersonal dynamics and connection quality.",
            growth: "Evaluate personal development and areas of growth.",
          }[options.focusOn]
        : "";

      const prompt = indentNicely`
        Model the mind of ${entityName}.
        
        ${
          keyEvents ? `Recent experiences to reflect upon:\n${keyEvents}\n` : ""
        }
        
        ${entityName} engages in ${options.depth} reflection on: "${
        options.topic
      }"
        
        ${depthInstructions[options.depth]}
        ${focusInstructions}
        
        This is ${entityName}'s honest, introspective reflection. Be thoughtful and genuine.
        Consider both positive insights and areas for improvement.
      `;

      console.log(`\n📚 [REFLECTION CONTEXT]`);
      console.log(`   Memories considered: ${relevantMemories.length}`);
      console.log(`   Key events extracted: ${keyEvents.split("\n").length}`);

      return {
        role: ChatMessageRoleEnum.System,
        content: prompt,
      };
    },

    schema:
      options.depth === "deep"
        ? z.object({
            insights: z
              .array(
                z.object({
                  insight: z.string(),
                  significance: z.enum(["minor", "moderate", "major"]),
                })
              )
              .describe("Key insights gained"),
            questions: z.array(z.string()).describe("Questions that arose"),
            emotions: z.object({
              during: z.string().describe("Emotions during the experience"),
              now: z.string().describe("Current emotional state"),
            }),
            growth: z.string().describe("Personal growth observed"),
            futureIntentions: z
              .array(z.string())
              .describe("Intentions moving forward"),
          })
        : undefined,

    postProcess: async (memory: WorkingMemory, response: any) => {
      console.log(`\n💭 [REFLECTION COMPLETE]`);

      let reflectionContent: string;

      if (typeof response === "object" && options.depth === "deep") {
        console.log(`   Insights gained: ${response.insights.length}`);
        console.log(`   Questions raised: ${response.questions.length}`);
        console.log(
          `   Emotional journey: ${response.emotions.during} → ${response.emotions.now}`
        );

        // Format deep reflection
        reflectionContent = [
          "Deep Reflection:",
          "\nInsights:",
          ...response.insights.map(
            (i: any) => `- ${i.insight} [${i.significance}]`
          ),
          "\nQuestions that arose:",
          ...response.questions.map((q: string) => `- ${q}`),
          `\nEmotional journey: ${response.emotions.during} → ${response.emotions.now}`,
          `\nGrowth observed: ${response.growth}`,
          "\nFuture intentions:",
          ...response.futureIntentions.map((i: string) => `- ${i}`),
        ].join("\n");
      } else {
        reflectionContent = response;
        console.log(`   Reflection length: ${response.length} chars`);
      }

      const reflectionMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `${memory.entityName} reflects: ${reflectionContent}`,
        metadata: {
          type: "reflection",
          topic: options.topic,
          depth: options.depth,
          focus: options.focusOn,
          timestamp: new Date().toISOString(),
        },
      };

      // Log reflection summary
      console.log(`\n📊 [REFLECTION SUMMARY]`);
      console.log(`   Type: ${options.depth} reflection on ${options.topic}`);
      console.log(`   Word count: ${reflectionContent.split(/\s+/).length}`);

      return [reflectionMemory, response];
    },

    // Use quality model for deep reflections
    modelClass: options.depth === "deep" ? "quality" : undefined,
  };
});

export default reflect;
