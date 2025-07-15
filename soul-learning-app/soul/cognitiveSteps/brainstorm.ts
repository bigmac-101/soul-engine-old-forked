/**
 * BRAINSTORM - Creative idea generation
 *
 * This cognitive step demonstrates:
 * 1. Creative thinking patterns
 * 2. Idea generation and evaluation
 * 3. Structured brainstorming output
 * 4. Creativity parameters
 */

import {
  createCognitiveStep,
  WorkingMemory,
  ChatMessageRoleEnum,
  indentNicely,
} from "@opensouls/core";
import { z } from "zod";

interface BrainstormOptions {
  topic: string;
  count?: number;
  constraints?: string[];
  evaluateFeasibility?: boolean;
  temperature?: number; // Creativity parameter
}

const brainstorm = createCognitiveStep((options: BrainstormOptions) => {
  const ideaCount = options.count || 5;

  console.log(`\n🧠💡 [BRAINSTORM] Generating ideas...`);
  console.log(`   Topic: ${options.topic}`);
  console.log(`   Target count: ${ideaCount}`);
  console.log(`   Creativity level: ${options.temperature || "default"}`);

  const ideaSchema = z.object({
    idea: z.string().describe("The core idea"),
    description: z.string().describe("Brief explanation"),
    feasibility: z.enum(["high", "medium", "low"]).optional(),
    creativity: z.number().min(1).max(10).describe("Creativity score"),
  });

  return {
    command: ({ entityName }: WorkingMemory) => {
      const constraintText = options.constraints
        ? `\nConstraints to consider:\n${options.constraints
            .map((c) => `- ${c}`)
            .join("\n")}`
        : "";

      const prompt = indentNicely`
        Model the mind of ${entityName}.
        
        ${entityName} is brainstorming creative ideas about: "${options.topic}"
        
        Generate exactly ${ideaCount} unique and creative ideas.
        ${constraintText}
        
        ${
          options.evaluateFeasibility
            ? "For each idea, evaluate its practical feasibility."
            : "Focus on creativity over practicality."
        }
        
        Be innovative and think outside conventional boundaries while staying true to ${entityName}'s personality.
      `;

      console.log(`\n🎨 [BRAINSTORM SETUP]`);
      console.log(`   Constraints: ${options.constraints?.length || 0}`);
      console.log(
        `   Evaluate feasibility: ${options.evaluateFeasibility || false}`
      );

      return {
        role: ChatMessageRoleEnum.System,
        content: prompt,
      };
    },

    schema: z.object({
      ideas: z.array(ideaSchema).length(ideaCount),
      theme: z.string().describe("Common theme across ideas"),
      mostCreative: z.number().describe("Index of most creative idea"),
    }),

    postProcess: async (memory: WorkingMemory, response: any) => {
      console.log(`\n✨ [BRAINSTORM RESULTS]`);
      console.log(`   Ideas generated: ${response.ideas.length}`);
      console.log(`   Theme: ${response.theme}`);
      console.log(`   Most creative: Idea #${response.mostCreative + 1}`);

      // Calculate statistics
      const avgCreativity =
        response.ideas.reduce(
          (sum: number, idea: any) => sum + idea.creativity,
          0
        ) / response.ideas.length;

      console.log(`\n📊 [BRAINSTORM STATS]`);
      console.log(`   Average creativity: ${avgCreativity.toFixed(1)}/10`);

      // Format ideas for memory
      const formattedIdeas = response.ideas
        .map(
          (idea: any, i: number) =>
            `${i + 1}. ${idea.idea} (Creativity: ${idea.creativity}/10)${
              idea.feasibility ? ` [Feasibility: ${idea.feasibility}]` : ""
            }\n   ${idea.description}`
        )
        .join("\n\n");

      const brainstormMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `${memory.entityName} brainstormed:\n\n${formattedIdeas}\n\nTheme: ${response.theme}`,
        metadata: {
          type: "brainstorm",
          topic: options.topic,
          ideaCount: response.ideas.length,
          avgCreativity,
          timestamp: new Date().toISOString(),
        },
      };

      return [brainstormMemory, response];
    },

    // Higher temperature for more creative responses
    temperature: options.temperature,
  };
});

export default brainstorm;
