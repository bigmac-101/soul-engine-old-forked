/**
 * INTERNAL MONOLOGUE - The soul's private thoughts
 *
 * This cognitive step demonstrates:
 * 1. How souls think internally
 * 2. Memory management for internal thoughts
 * 3. Verb-based thought patterns
 * 4. The difference between internal and external communication
 */

import {
  createCognitiveStep,
  WorkingMemory,
  ChatMessageRoleEnum,
  indentNicely,
} from "@opensouls/core";

interface InternalMonologueOptions {
  instructions: string;
  verb?: string;
  modelClass?: "quality" | "fast" | "reasoning";
  postProcess?: (
    memory: WorkingMemory,
    thought: string
  ) => Promise<[any, string]>;
}

/**
 * Internal Monologue - How souls think privately
 *
 * This step allows the soul to have internal thoughts that aren't
 * directly communicated to the user but influence its mental state.
 */
const internalMonologue = createCognitiveStep(
  (options: InternalMonologueOptions) => {
    const verb = options.verb || "thinks";

    console.log(`\n💭 [INTERNAL MONOLOGUE] Soul is ${verb}...`);
    console.log(
      `   Instructions: ${options.instructions.substring(0, 100)}...`
    );

    return {
      command: ({ entityName }: WorkingMemory) => {
        const prompt = indentNicely`
        Model the mind of ${entityName}.
        
        ${options.instructions}
        
        Write ${entityName}'s internal monologue as they ${verb}.
        This is their private thought, not spoken aloud.
        Be genuine to their personality and current mental state.
      `;

        console.log(`\n📝 [INTERNAL COMMAND]:`);
        console.log(`   Verb: ${verb}`);
        console.log(`   Entity: ${entityName}`);

        return {
          role: ChatMessageRoleEnum.System,
          content: prompt,
        };
      },

      postProcess: async (memory: WorkingMemory, thought: string) => {
        console.log(`\n🧠 [INTERNAL THOUGHT PROCESSING]`);
        console.log(`   Raw thought: ${thought.substring(0, 150)}...`);

        // Clean the thought of any entity name prefixes
        const cleanThought = thought.replace(
          new RegExp(`^${memory.entityName}:?\\s*`, "i"),
          ""
        );

        // Create the internal memory with special formatting
        const internalMemory = {
          role: ChatMessageRoleEnum.Assistant,
          content: `${memory.entityName} ${verb}: ${cleanThought}`,
          metadata: {
            type: "internal_monologue",
            verb: verb,
            timestamp: new Date().toISOString(),
          },
        };

        console.log(
          `   Formatted as: "${
            memory.entityName
          } ${verb}: ${cleanThought.substring(0, 80)}..."`
        );
        console.log(`   Memory type: internal_monologue`);

        // Use custom post-processor if provided
        if (options.postProcess) {
          return options.postProcess(memory, cleanThought);
        }

        return [internalMemory, cleanThought];
      },

      // Model class selection for different thinking speeds
      modelClass: options.modelClass,
    };
  }
);

export default internalMonologue;
