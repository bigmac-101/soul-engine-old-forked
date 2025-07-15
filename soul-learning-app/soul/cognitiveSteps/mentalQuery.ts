/**
 * MENTAL QUERY - How souls access their knowledge
 *
 * This cognitive step demonstrates:
 * 1. Querying internal knowledge and memories
 * 2. Structured information retrieval
 * 3. Memory consolidation
 * 4. Knowledge synthesis
 */

import {
  createCognitiveStep,
  WorkingMemory,
  ChatMessageRoleEnum,
  indentNicely,
} from "@opensouls/core";
import { z } from "zod";

interface MentalQueryOptions {
  query: string;
  verb?: string;
  structuredResponse?: boolean;
  modelClass?: "quality" | "fast" | "reasoning";
}

/**
 * Mental Query - Accessing and synthesizing internal knowledge
 *
 * This step allows the soul to query its own knowledge base,
 * memories, and understanding to synthesize information.
 */
const mentalQuery = createCognitiveStep((options: MentalQueryOptions) => {
  const verb = options.verb || "considers";

  console.log(`\n🔍 [MENTAL QUERY] Soul ${verb}...`);
  console.log(`   Query: ${options.query}`);
  console.log(`   Structured: ${options.structuredResponse || false}`);

  return {
    command: (memory: WorkingMemory) => {
      const entityName = (memory as any).entityName || memory.soulName;
      // Extract key information from memories
      const relevantMemories = memory.memories
        .filter((m) => m.content.length > 50)
        .slice(-10)
        .map((m, i) => `[${i}] ${m.role}: ${m.content}`)
        .join("\n\n");

      const prompt = indentNicely`
        Model the mind of ${entityName}.
        
        ${entityName}'s recent memories and context:
        ${relevantMemories}
        
        ${entityName} ${verb} the following query:
        "${options.query}"
        
        ${entityName} searches through their knowledge, memories, and understanding to formulate a comprehensive response.
        The response should synthesize available information and ${entityName}'s unique perspective.
        
        ${
          options.structuredResponse
            ? "Provide a structured response with clear sections."
            : "Provide a thoughtful, flowing response."
        }
      `;

      console.log(`\n📚 [QUERY CONTEXT]`);
      console.log(
        `   Memories analyzed: ${Math.min(10, memory.memories.length)}`
      );
      console.log(
        `   Total memory size: ${memory.memories.reduce(
          (acc, m) => acc + m.content.length,
          0
        )} chars`
      );

      return {
        role: ChatMessageRoleEnum.System,
        content: prompt,
      };
    },

    schema: options.structuredResponse
      ? z.object({
          summary: z.string().describe("Brief summary of findings"),
          details: z.array(z.string()).describe("Key points discovered"),
          confidence: z
            .enum(["high", "medium", "low"])
            .describe("Confidence in the response"),
          sources: z
            .array(z.string())
            .describe("Memory sources used")
            .optional(),
        })
      : undefined,

    postProcess: async (memory: WorkingMemory, response: any) => {
      console.log(`\n💡 [QUERY RESULT]`);

      if (options.structuredResponse && typeof response === "object") {
        console.log(`   Summary: ${response.summary}`);
        console.log(`   Details: ${response.details.length} points`);
        console.log(`   Confidence: ${response.confidence}`);

        // Format structured response as readable text
        const formattedResponse = [
          `Summary: ${response.summary}`,
          `\nKey Points:`,
          ...response.details.map((d: string, i: number) => `${i + 1}. ${d}`),
          `\nConfidence: ${response.confidence}`,
          response.sources ? `\nSources: ${response.sources.join(", ")}` : "",
        ].join("\n");

        const queryMemory = {
          role: ChatMessageRoleEnum.Assistant,
          content: `${
            (memory as any).entityName || memory.soulName
          } ${verb}: ${formattedResponse}`,
          metadata: {
            type: "mental_query",
            query: options.query,
            structured: true,
            confidence: response.confidence,
            timestamp: new Date().toISOString(),
          },
        };

        return [queryMemory, response];
      }

      // Unstructured response
      console.log(`   Response length: ${response.length} chars`);
      console.log(`   Response preview: ${response}`);

      const queryMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `${
          (memory as any).entityName || memory.soulName
        } ${verb}: ${response}`,
        metadata: {
          type: "mental_query",
          query: options.query,
          structured: false,
          timestamp: new Date().toISOString(),
        },
      };

      return [queryMemory, response];
    },

    modelClass: options.modelClass,
  };
});

export default mentalQuery;
