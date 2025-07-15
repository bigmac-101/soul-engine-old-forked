/**
 * PERCEIVE - How souls interpret sensory input
 *
 * This cognitive step demonstrates:
 * 1. Processing external stimuli
 * 2. Emotional interpretation
 * 3. Pattern recognition
 * 4. Contextual understanding
 */

import {
  createCognitiveStep,
  WorkingMemory,
  ChatMessageRoleEnum,
  indentNicely,
} from "@opensouls/core";
import { z } from "zod";

interface PerceiveOptions {
  stimulus: string;
  type: "visual" | "auditory" | "textual" | "emotional" | "environmental";
  analyzeEmotions?: boolean;
  detectPatterns?: boolean;
}

const perceive = createCognitiveStep((options: PerceiveOptions) => {
  console.log(`\n👁️ [PERCEIVE] Processing ${options.type} stimulus...`);
  console.log(`   Stimulus: ${options.stimulus}`);

  return {
    command: (memory: WorkingMemory) => {
      const entityName = (memory as any).entityName || memory.soulName;
      const recentPerceptions = memory.memories
        .filter((m) => m.metadata?.type === "perception")
        .slice(-3)
        .map((m) => m.content)
        .join("\n");

      const prompt = indentNicely`
        Model the mind of ${entityName}.
        
        ${
          recentPerceptions ? `Recent perceptions:\n${recentPerceptions}\n` : ""
        }
        
        ${entityName} perceives the following ${options.type} stimulus:
        "${options.stimulus}"
        
        Process this perception through ${entityName}'s unique consciousness:
        - What does ${entityName} notice first?
        - How does this make ${entityName} feel?
        - What memories or associations does this trigger?
        ${
          options.detectPatterns
            ? "- What patterns or connections are recognized?"
            : ""
        }
        ${
          options.analyzeEmotions
            ? "- What emotional undertones are detected?"
            : ""
        }
        
        Describe ${entityName}'s perception in first person.
      `;

      console.log(`\n🔍 [PERCEPTION CONTEXT]`);
      console.log(
        `   Previous perceptions: ${
          memory.memories.filter((m) => m.metadata?.type === "perception")
            .length
        }`
      );
      console.log(`   Analyze emotions: ${options.analyzeEmotions || false}`);
      console.log(`   Detect patterns: ${options.detectPatterns || false}`);

      return {
        role: ChatMessageRoleEnum.System,
        content: prompt,
      };
    },

    schema:
      options.analyzeEmotions || options.detectPatterns
        ? z.object({
            initialImpression: z.string().describe("First impression"),
            details: z.array(z.string()).describe("Specific details noticed"),
            emotionalResponse: options.analyzeEmotions
              ? z.object({
                  primary: z.string().describe("Primary emotion"),
                  intensity: z.enum(["subtle", "moderate", "strong"]),
                  valence: z.enum(["positive", "negative", "neutral", "mixed"]),
                })
              : z.any().optional(),
            patterns: options.detectPatterns
              ? z.array(z.string()).describe("Patterns recognized")
              : z.any().optional(),
            associations: z
              .array(z.string())
              .describe("Triggered memories or associations"),
          })
        : undefined,

    postProcess: async (memory: WorkingMemory, response: any) => {
      console.log(`\n🎯 [PERCEPTION PROCESSED]`);

      let perceptionContent: string;

      if (typeof response === "object") {
        console.log(`   Initial impression: ${response.initialImpression}`);
        console.log(`   Details noticed: ${response.details.length}`);
        if (response.emotionalResponse) {
          console.log(
            `   Emotional response: ${response.emotionalResponse.primary} (${response.emotionalResponse.intensity})`
          );
        }

        perceptionContent = [
          response.initialImpression,
          response.details.length > 0
            ? `\nI notice: ${response.details.join(", ")}`
            : "",
          response.emotionalResponse
            ? `\nThis makes me feel ${response.emotionalResponse.primary} (${response.emotionalResponse.intensity}, ${response.emotionalResponse.valence})`
            : "",
          response.patterns?.length > 0
            ? `\nPatterns: ${response.patterns.join(", ")}`
            : "",
          response.associations.length > 0
            ? `\nThis reminds me of: ${response.associations.join(", ")}`
            : "",
        ]
          .filter(Boolean)
          .join("");
      } else {
        perceptionContent = response;
        console.log(`   Raw perception length: ${response.length} chars`);
      }

      const perceptionMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `${
          (memory as any).entityName || memory.soulName
        } perceives: ${perceptionContent}`,
        metadata: {
          type: "perception",
          stimulusType: options.type,
          timestamp: new Date().toISOString(),
          analyzedEmotions: options.analyzeEmotions || false,
          detectedPatterns: options.detectPatterns || false,
        },
      };

      return [perceptionMemory, response];
    },
  };
});

export default perceive;
