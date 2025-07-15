# Local Soul Runner Guide

## 🚀 Quick Start (No Cloud Auth Required!)

The Local Soul Runner (`npm run local`) is the **recommended way** to explore the OPEN SOULS framework without any cloud services or browser authentication.

### Setup

1. **Install dependencies**:

```bash
cd soul-learning-app
npm install
```

2. **Configure API keys**:

```bash
cp env.example .env
# Edit .env and add your OpenAI API key
```

3. **Run the local soul**:

```bash
npm run local
```

That's it! No browser login, no cloud services, just the real OPEN SOULS framework running locally.

## 🎯 What the Local Runner Does

The local runner (`src/local-soul-runner.ts`) provides:

1. **Real WorkingMemory** - Uses the actual `@opensouls/core` WorkingMemory class
2. **Real Cognitive Steps** - Loads and executes your cognitive steps
3. **No Cloud Dependencies** - Everything runs on your machine
4. **Direct LLM Integration** - Uses your API keys directly

## 🔧 How It Works

### 1. Soul Loading

```typescript
// Loads soul blueprint from markdown
const blueprint = readFileSync("soul/Scholar.md");

// Creates WorkingMemory with the real framework
this.workingMemory = new WorkingMemory({
  soulName: "Scholar",
  memories: [...]
});
```

### 2. Cognitive Step Execution

```typescript
// Loads your cognitive steps
const steps = await import("soul/cognitiveSteps/index.js");

// Executes them with real WorkingMemory transformations
const [newMemory, response] = await externalDialog(workingMemory, options);
```

### 3. Direct LLM Calls

- Cognitive steps use your OpenAI/Anthropic API keys
- No middleware or cloud services
- Direct model invocation

## 📊 Differences from Cloud Version

| Feature         | Local Runner     | Cloud Soul Engine |
| --------------- | ---------------- | ----------------- |
| Authentication  | None needed      | Browser login     |
| API Keys        | Your own         | Managed by cloud  |
| Hosting         | Your machine     | Cloud servers     |
| WorkingMemory   | Real framework   | Real framework    |
| Cognitive Steps | Your local files | Deployed to cloud |
| Persistence     | In-memory        | Cloud storage     |

## 🛠️ Customization

### Using Different Models

Edit your cognitive steps to use different models:

```typescript
// In any cognitive step
const response = await processor.process({
  model: "gpt-4", // or "claude-3", etc.
  // ...
});
```

### Adding Persistence

The local runner uses in-memory storage. To add persistence:

```typescript
// Replace the Map with a database
const soulMemoryStore = new Map(); // Change to Redis, SQLite, etc.
```

### Custom Cognitive Process

Modify `runCognitiveProcess()` in the local runner to implement your soul's logic:

```typescript
private async runCognitiveProcess() {
  // Add your soul's unique cognitive flow here
  // Chain cognitive steps as needed
}
```

## 🐛 Troubleshooting

### "Cannot find module" errors

- Run `npm run build` in the root directory first
- Ensure all packages are built

### API errors

- Check your `.env` file has valid API keys
- Ensure you have API credits

### No response from soul

- Check console for errors
- Cognitive steps might be failing silently
- Add more logging to debug

## 🎓 Learning Tips

1. **Start Simple**: Use just `externalDialog` first
2. **Add Logging**: Every cognitive step logs its operation
3. **Watch Memory Growth**: Use the `memory` command to inspect
4. **Experiment**: Modify the cognitive process flow

## 🔮 Next Steps

1. Create new cognitive steps
2. Implement complex mental processes
3. Add tool integration
4. Build multi-soul interactions
5. Add persistent memory with a database

The local runner gives you full control over the OPEN SOULS framework without any external dependencies. Happy soul building! 🚀
