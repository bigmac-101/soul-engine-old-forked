/**
 * EXTERNAL DIALOG - Communication with the outside world
 *
 * This cognitive step demonstrates:
 * 1. How souls communicate with users
 * 2. Streaming vs non-streaming responses
 * 3. Custom post-processing
 * 4. Working memory transformation
 */

import {
  createCognitiveStep,
  WorkingMemory,
  ChatMessageRoleEnum,
  indentNicely,
  stripEntityAndVerb,
} from "@opensouls/core";
import { z } from "zod";

// Define the interface for external dialog options
interface ExternalDialogOptions {
  instructions: string;
  stream?: boolean;
  model?: "quality" | "fast" | "reasoning";
  postProcess?: (
    memory: WorkingMemory,
    response: string
  ) => Promise<[any, string]>;
}

/**
 * External Dialog - How souls speak to the outside world
 *
 * This is one of the most important cognitive steps as it handles
 * all communication from the soul to the user.
 */
const externalDialog = createCognitiveStep((options: ExternalDialogOptions) => {
  console.log(`\n🗣️  [EXTERNAL DIALOG] Preparing to speak...`);
  console.log(
    `   Options: stream=${options.stream}, model=${options.model || "default"}`
  );

  return {
    command: ({ entityName }: WorkingMemory) => {
      // This demonstrates how commands are constructed
      const prompt = indentNicely`
        Model the mind of ${entityName}.
        
        ${options.instructions}
        
        Reply as ${entityName} would reply. Keep in mind ${entityName}'s personality and background.
      `;

      console.log(`\n📝 [COMMAND CONSTRUCTION]:`);
      console.log(prompt);

      return {
        role: ChatMessageRoleEnum.System,
        content: prompt,
      };
    },

    // Optional schema validation for structured responses
    schema:
      options.model === "reasoning"
        ? z.object({
            thought: z.string().describe("The internal reasoning process"),
            response: z.string().describe("The actual response to speak"),
          })
        : undefined,

    // Post-processing allows transformation of the response
    postProcess: async (memory: WorkingMemory, response: any) => {
      console.log(`\n🔄 [POST PROCESS] Processing response...`);

      if (options.model === "reasoning" && typeof response === "object") {
        console.log(`   💭 Thought: ${response.thought}`);
        console.log(`   💬 Response: ${response.response}`);

        // Add the thought as an internal memory
        const thoughtMemory = {
          role: ChatMessageRoleEnum.Assistant,
          content: `[Internal: ${response.thought}]`,
        };

        const spokenMemory = {
          role: ChatMessageRoleEnum.Assistant,
          content: stripEntityAndVerb(response.response),
        };

        return [[thoughtMemory, spokenMemory], response.response];
      }

      // Default processing
      const cleanResponse = stripEntityAndVerb(response);
      console.log(
        `   📤 Clean response: ${cleanResponse.substring(0, 100)}...`
      );

      const assistantMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: cleanResponse,
      };

      // Use custom post-processor if provided
      if (options.postProcess) {
        return options.postProcess(memory, cleanResponse);
      }

      return [assistantMemory, cleanResponse];
    },

    // Stream processor for real-time streaming
    streamProcessor: options.stream
      ? async (memory: WorkingMemory, stream: AsyncIterable<string>) => {
          console.log(`\n🌊 [STREAM PROCESSOR] Starting stream...`);
          let chunkCount = 0;

          async function* processStream() {
            for await (const chunk of stream) {
              chunkCount++;
              if (chunkCount % 10 === 0) {
                console.log(`   📦 Streamed ${chunkCount} chunks...`);
              }
              yield chunk;
            }
            console.log(`   ✅ Stream complete. Total chunks: ${chunkCount}`);
          }

          return processStream();
        }
      : undefined,
  };
});

export default externalDialog;
