# OPEN SOULS Learning Guide

This guide helps you understand the OPEN SOULS framework through our comprehensive terminal application.

## 🎓 Learning Path

### 1. Start with the Direct Demo (No Engine Required)

```bash
npm run demo
```

This demonstrates core concepts without needing the Soul Engine:

- WorkingMemory structure and operations
- How cognitive transformations work
- Memory metadata and filtering
- Conceptual overview of cognitive steps
- Mental process architecture

### 2. Study the Code Structure

#### Core Concepts to Understand:

**WorkingMemory** (`@opensouls/core`)

- Immutable data structure
- Append-only memory building
- Metadata support
- Memory roles (system, user, assistant)

**Cognitive Steps** (`soul/cognitiveSteps/`)

- Pure functions: WorkingMemory → WorkingMemory
- Command generation
- Response post-processing
- Schema validation with Zod
- Streaming support

**Mental Processes** (`soul/subprocesses/`)

- Hierarchical thought organization
- Parameter passing
- Process invocation
- State management

### 3. Code Reading Order

1. **Start with**: `soul/Scholar.md`

   - Understand the soul's personality
   - Note the traits and communication style

2. **Then read**: `soul/initialProcess.ts`

   - Entry point for the soul
   - Shows all major features
   - Demonstrates subprocess branching

3. **Study cognitive steps** (in order):

   - `externalDialog.ts` - Basic communication
   - `internalMonologue.ts` - Private thoughts
   - `decision.ts` - Structured choices
   - `mentalQuery.ts` - Knowledge access
   - `brainstorm.ts` - Creative thinking
   - `perceive.ts` - Input processing
   - `reflect.ts` - Self-analysis

4. **Explore subprocesses**:
   - `learningProcess.ts` - Question-answer loops
   - `teachingProcess.ts` - Adaptive instruction
   - `emotionalProcess.ts` - Empathetic responses

### 4. Key Patterns to Notice

#### Cognitive Step Pattern

```typescript
const myStep = createCognitiveStep((options) => {
  return {
    command: ({ entityName }) => {
      // Generate LLM prompt
    },
    schema: z.object({
      // Optional structured output
    }),
    postProcess: async (memory, response) => {
      // Transform response into memory
      return [newMemory, processedResponse];
    },
  };
});
```

#### Mental Process Pattern

```typescript
const myProcess: MentalProcess = async ({ workingMemory }) => {
  const { speak, log } = useActions();

  // Chain cognitive steps
  let memory = workingMemory;
  memory = await cognitiveStep1(memory, options);
  memory = await cognitiveStep2(memory, options);

  // Return final memory state
  return memory;
};
```

### 5. Understanding the Logs

When you run the full app (`npm run dev`), watch for:

**Initialization Logs**:

- `[INITIAL PROCESS]` - Soul awakening
- `[STEP N]` - Process flow steps
- Memory state changes

**Cognitive Step Logs**:

- `[COMMAND CONSTRUCTION]` - LLM prompts
- `[POST PROCESS]` - Response handling
- `[STREAM PROCESSOR]` - Real-time chunks

**Memory Logs**:

- `📊 Initial Working Memory State`
- `💾 Response stored in working memory`
- Metadata additions

### 6. Experiments to Try

1. **Modify Scholar's personality** in `Scholar.md`

   - Change traits
   - Alter communication style
   - See behavior changes

2. **Create a new cognitive step**:

   ```typescript
   // soul/cognitiveSteps/analyze.ts
   const analyze = createCognitiveStep((options) => {
     // Your implementation
   });
   ```

3. **Add logging to understand flow**:

   - Add console.log in postProcess
   - Track memory transformations
   - Monitor decision points

4. **Create a simple subprocess**:
   - Focus on one specific behavior
   - Chain 3-4 cognitive steps
   - Return transformed memory

### 7. Advanced Topics

**Streaming**:

- See `externalDialog.ts` streamProcessor
- Observe chunk-by-chunk output
- Note async generator pattern

**Schema Validation**:

- See `decision.ts` and `brainstorm.ts`
- Structured outputs with Zod
- Type-safe responses

**Memory Metadata**:

- See how steps add metadata
- Filter memories by type
- Track cognitive operations

**Model Selection**:

- Note `modelClass` parameter
- Different models for different tasks
- Quality vs speed tradeoffs

### 8. Debugging Tips

1. **Enable verbose logging**:

   - Already extensive in this demo
   - Add more console.log as needed

2. **Inspect memory state**:

   ```typescript
   console.log("Memory count:", memory.memories.length);
   console.log("Last memory:", memory.memories.slice(-1));
   ```

3. **Track transformations**:
   - Log before/after each step
   - Compare memory states
   - Identify where issues occur

### 9. Building Your Own Soul

1. **Create personality** (`MySoul.md`)
2. **Design initial process**
3. **Implement needed cognitive steps**
4. **Create specialized subprocesses**
5. **Test with extensive logging**
6. **Iterate on behavior**

### 10. Framework Philosophy

Remember the core principles:

- **Souls have personality** - Not just tools
- **Immutable transformations** - Predictable flow
- **Cognitive building blocks** - Composable thoughts
- **Purpose-driven** - Clear intentions
- **Emotional depth** - Beyond logic

## 🚀 Next Steps

1. Run the direct demo to understand concepts
2. Study the code with this guide
3. Run the full app with Soul Engine
4. Modify and experiment
5. Create your own soul
6. Share your learnings!

Remember: The extensive logging is for learning. In production, you'd reduce it for performance.

Happy learning! 🎓✨
