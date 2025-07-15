# OPEN SOULS Learning Terminal Application

This is a comprehensive demonstration of the OPEN SOULS framework running entirely locally. It showcases all major features of the soul framework with extensive logging to help you understand how AI souls work internally.

## 🎯 Purpose

This application demonstrates:

- **Soul Lifecycle**: Initialization, connection, and shutdown
- **Working Memory**: How souls manage and transform memories
- **Cognitive Steps**: All 7 types with detailed logging
- **Mental Processes**: Complex subprocess invocation
- **Streaming Responses**: Real-time text generation
- **Event Architecture**: How souls communicate
- **Persistent Memory**: Cross-conversation memory storage

## 📁 Project Structure

```
soul-learning-app/
├── src/
│   └── index.ts          # Main terminal application
├── soul/
│   ├── Scholar.md        # Soul personality blueprint
│   ├── initialProcess.ts # Entry point mental process
│   ├── cognitiveSteps/   # All cognitive step implementations
│   │   ├── externalDialog.ts    # Soul → User communication
│   │   ├── internalMonologue.ts # Private thoughts
│   │   ├── decision.ts          # Structured choices
│   │   ├── mentalQuery.ts       # Knowledge synthesis
│   │   ├── brainstorm.ts        # Creative ideation
│   │   ├── perceive.ts          # Sensory processing
│   │   └── reflect.ts           # Self-analysis
│   └── subprocesses/     # Complex mental processes
│       ├── learningProcess.ts   # Active learning mode
│       ├── teachingProcess.ts   # Knowledge sharing mode
│       └── emotionalProcess.ts  # Empathetic support mode
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **OpenAI API Key** (or Anthropic API key)

### Installation

1. **Build the OPEN SOULS packages first** (from repository root):

```bash
cd /path/to/open-souls
npm install
npm run build:all
```

2. **Install the learning app dependencies**:

```bash
cd soul-learning-app
npm install
```

3. **Set up environment variables**:

```bash
# Copy the example environment file
cp env.example .env

# Edit .env and add your OpenAI API key
# The local runner uses this directly - no cloud auth needed!
```

### Running the Application

Since the official Soul Engine is shut down, we have three ways to run this:

#### Option 1: Direct Demo (No Engine, No API calls)

```bash
cd soul-learning-app
npm run demo
```

This demonstrates the concepts without making any API calls.

#### Option 2: Local Runner (Real Framework, No Cloud Auth) ⭐ RECOMMENDED

```bash
cd soul-learning-app
npm run local
```

This uses the real OPEN SOULS framework components locally. You'll need:

- API keys in your `.env` file for the LLM calls
- No cloud authentication or browser login required!
- This is the best way to see the real framework in action

#### Option 3: Full Soul Engine (Original Architecture)

**Terminal 1 - Start Local Soul Engine:**

```bash
cd soul-learning-app
npm run soul-engine
# This starts the local engine on port 8080
```

**Terminal 2 - Run the Learning App:**

```bash
cd soul-learning-app
npm run dev
```

## 🎮 Using the Application

### Interactive Commands

- **Regular conversation**: Just type your message
- **`exit`**: End the conversation
- **`debug`**: Show soul state information
- **`memory`**: Inspect working memory (simulated)

### What You'll See

1. **Initialization Phase**:

   - Soul blueprint loading
   - Connection establishment
   - Initial memory setup

2. **Conversation Phase**:

   - Real-time streaming responses
   - Cognitive step execution logs
   - Memory transformations
   - Process invocations

3. **Behind the Scenes**:
   - Every cognitive step shows:
     - Input parameters
     - Command construction
     - Post-processing
     - Memory updates
   - Mental processes show:
     - Subprocess branching
     - Parameter passing
     - State transitions

## 📊 Understanding the Logs

### Log Prefixes

- 🧠 `[INITIAL PROCESS]` - Main entry point activity
- 💭 `[INTERNAL MONOLOGUE]` - Private thoughts
- 🗣️ `[EXTERNAL DIALOG]` - User communication
- 🎯 `[DECISION]` - Choice points
- 🔍 `[MENTAL QUERY]` - Knowledge access
- 🧠💡 `[BRAINSTORM]` - Creative thinking
- 👁️ `[PERCEIVE]` - Input processing
- 🪞 `[REFLECT]` - Self-analysis
- 📚 `[LEARNING PROCESS]` - Learning subprocess
- 🎓 `[TEACHING PROCESS]` - Teaching subprocess
- 💝 `[EMOTIONAL PROCESS]` - Emotional support

### Memory Operations

Watch for:

- Memory count changes
- Content transformations
- Metadata additions
- Role assignments

## 🔧 Customization

### Adding New Cognitive Steps

1. Create new file in `soul/cognitiveSteps/`
2. Follow the pattern:

```typescript
import { createCognitiveStep } from "@opensouls/core";

const myStep = createCognitiveStep((options) => {
  console.log("Step executing...");
  return {
    command: ({ entityName }) => {
      /* ... */
    },
    postProcess: async (memory, response) => {
      /* ... */
    },
  };
});
```

### Adding New Mental Processes

1. Create new file in `soul/subprocesses/`
2. Implement the `MentalProcess` interface
3. Import and invoke from `initialProcess.ts`

## 🐛 Troubleshooting

### "Cannot connect to engine"

- Ensure soul engine is running on port 8080
- Check firewall settings
- Verify no other services on that port

### "Module not found" errors

- Rebuild the OPEN SOULS packages
- Check symbolic links are created
- Verify all dependencies installed

### "API key errors"

- Set OPENAI_API_KEY in environment
- Check key validity
- Ensure sufficient credits

## 📚 Learning Resources

- Study the cognitive step implementations
- Follow the execution flow in logs
- Modify parameters and observe changes
- Create new souls with different personalities

## 🎓 Key Concepts Demonstrated

1. **Working Memory**: Append-only context building
2. **Cognitive Steps**: Functional transformations on memory
3. **Mental Processes**: Hierarchical thought organization
4. **Event System**: Asynchronous soul-world interaction
5. **Streaming**: Real-time response generation
6. **Schema Validation**: Structured outputs with Zod
7. **Model Selection**: Using different models for different tasks

## 🚧 Limitations

- Requires local engine (no cloud service)
- User input simulation in some processes
- Limited to terminal interface
- No real tool/action execution

## 🔮 Future Enhancements

- Web interface with better visualization
- Real tool integration
- Memory persistence to disk
- Multi-soul interactions
- Voice input/output
- Emotion visualization

---

**Remember**: This is a learning tool. The extensive logging helps you understand the inner workings of AI souls. In production, you'd reduce logging for performance.
