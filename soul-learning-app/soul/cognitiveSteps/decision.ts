/**
 * DECISION - How souls make choices
 *
 * This cognitive step demonstrates:
 * 1. Structured decision making with typed choices
 * 2. Schema validation for decisions
 * 3. Decision logging and tracking
 * 4. How decisions affect working memory
 */

import {
  createCognitiveStep,
  WorkingMemory,
  ChatMessageRoleEnum,
  indentNicely,
} from "@opensouls/core";
import { z } from "zod";

interface DecisionOptions<T extends readonly string[]> {
  question: string;
  choices: T;
  context?: string;
  postProcess?: (
    memory: WorkingMemory,
    choice: T[number]
  ) => Promise<[any, T[number]]>;
}

/**
 * Decision - Structured choice-making for souls
 *
 * This step forces the soul to make a specific choice from a list,
 * ensuring deterministic behavior when needed.
 */
const decision = createCognitiveStep(
  <T extends readonly string[]>(options: DecisionOptions<T>) => {
    console.log(`\n🎯 [DECISION] Making a choice...`);
    console.log(`   Question: ${options.question}`);
    console.log(`   Choices: ${options.choices.join(", ")}`);

    // Create dynamic Zod schema based on choices
    const choiceSchema = z.object({
      choice: z.enum(options.choices as any),
    });

    return {
      command: (memory: WorkingMemory) => {
        const entityName = (memory as any).entityName || memory.soulName;
        // Analyze recent context for better decision making
        const recentContext = memory.memories
          .slice(-5)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n");

        const prompt = indentNicely`
        Model the mind of ${entityName}.
        
        Recent context:
        ${recentContext}
        
        ${options.context ? `Additional context: ${options.context}` : ""}
        
        ${entityName} must make a decision.
        
        Question: ${options.question}
        
        Available choices:
        ${options.choices.map((choice, i) => `${i + 1}. ${choice}`).join("\n")}
        
        ${entityName} considers their personality, the context, and makes the most appropriate choice.
        
        IMPORTANT: Respond with a JSON object containing your choice.
        Format: {"choice": "your_choice_here"}
        where your_choice_here is exactly one of the choices above.
      `;

        console.log(`\n📋 [DECISION CONTEXT]`);
        console.log(
          `   Recent memories analyzed: ${memory.memories.slice(-5).length}`
        );
        console.log(`   Entity making decision: ${entityName}`);

        return {
          role: ChatMessageRoleEnum.System,
          content: prompt,
        };
      },

      schema: choiceSchema,

      postProcess: async (
        memory: WorkingMemory,
        result: { choice: T[number] }
      ) => {
        const choice = result.choice;

        console.log(`\n✅ [DECISION MADE]`);
        console.log(`   Choice: "${choice}"`);
        console.log(`   Choice index: ${options.choices.indexOf(choice)}`);

        // Create a decision memory with metadata
        const decisionMemory = {
          role: ChatMessageRoleEnum.Assistant,
          content: `${
            (memory as any).entityName || memory.soulName
          } decided: ${choice}`,
          metadata: {
            type: "decision",
            question: options.question,
            choice: choice,
            choiceIndex: options.choices.indexOf(choice),
            allChoices: options.choices,
            timestamp: new Date().toISOString(),
          },
        };

        // Log decision statistics
        console.log(`\n📊 [DECISION STATS]`);
        console.log(`   Question length: ${options.question.length} chars`);
        console.log(`   Number of choices: ${options.choices.length}`);
        console.log(`   Decision timestamp: ${new Date().toISOString()}`);

        // Use custom post-processor if provided
        if (options.postProcess) {
          return options.postProcess(memory, choice);
        }

        return [decisionMemory, choice];
      },
    };
  }
);

export default decision;
