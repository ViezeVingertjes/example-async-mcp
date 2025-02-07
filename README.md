# MCP Async Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> 🚀 A high-performance Model Context Protocol (MCP) server implementation showcasing asynchronous task processing with robust status tracking and error handling.

<p align="center">
  <em>Built with TypeScript • Powered by Node.js • MCP Protocol</em>
</p>

---

## ✨ Features

- 🔄 **Asynchronous Task Processing** - Handle long-running operations efficiently
- 📊 **Real-time Status Tracking** - Monitor task progress with polling support
- 🧹 **Automatic Resource Management** - Smart task cleanup and memory management
- ⏱️ **Timeout Handling** - Configurable timeouts for tasks
- 🛡️ **Robust Error Handling** - Custom error types and comprehensive error reporting
- 📝 **TypeScript Support** - Full type safety and modern JavaScript features
- 🔍 **Built-in Inspector** - Debug and test your MCP server with ease

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/ViezeVingertjes/example-async-mcp.git

# Navigate to the project directory
cd example-async-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Running the Server

```bash
npm start
```

### Using the Inspector

```bash
npm run inspector
```

## 📖 API Reference

### Available Tools

#### `process_task`

Creates a new asynchronous task.

```json
{
  "name": "process_task",
  "arguments": {
    "input": "Hello, World!",
    "delayMs": 5000,
    "timeoutMs": 30000
  }
}
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| input | string | ✅ | - | The input string to process |
| delayMs | number | ❌ | 5000 | Processing delay in milliseconds |
| timeoutMs | number | ❌ | 30000 | Task timeout in milliseconds |

#### `check_task_status`

Check the status of an existing task.

```json
{
  "name": "check_task_status",
  "arguments": {
    "taskId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | ✅ | The ID of the task to check |

### Task States

| Status | Description |
|--------|-------------|
| 🕒 `pending` | Task created but not started |
| ⚡ `processing` | Task is being processed |
| ✅ `complete` | Task completed successfully |
| ❌ `error` | Task failed |

## ⚙️ Configuration

Key configuration options in `src/constants.ts`:

```typescript
export const DEFAULT_TASK_TIMEOUT_MS = 30000; // 30 seconds
export const DEFAULT_TASK_DELAY_MS = 5000;    // 5 seconds
export const DEFAULT_POLL_DELAY_MS = 10000;   // 10 seconds
export const POLL_INTERVAL_MS = 100;          // 100ms
export const MAX_TASKS = 1000;                // Maximum concurrent tasks
```

## 🛠️ Development

### Project Structure

```
src/
├── index.ts       # Main server implementation
├── types.ts       # TypeScript types and interfaces
├── constants.ts   # Configuration constants
└── utils.ts       # Utility functions
```

### Development Commands

```bash
# Build the project
npm run build

# Watch for changes
npm run watch

# Run tests
npm test                  # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report
npm run test:ui          # Open interactive test UI

# Run linter
npm run lint
```

### Testing

The project uses Vitest for testing, offering several advantages:
- 🚄 Up to 20x faster than Jest
- 📝 Native TypeScript support
- 🔄 Watch mode with HMR
- 🎯 Smart test filtering
- 📊 Built-in coverage reporting
- 🖥️ Interactive UI mode
- ⚡ Powered by Vite

Example test:
```typescript
import { describe, it, expect } from 'vitest';
import { sleep } from './utils';

describe('Utils', () => {
  it('should wait for the specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(100);
  });
});
```

Run the interactive UI to view and debug tests:
```bash
npm run test:ui
```

## 🤝 Contributing

We love your input! We want to make contributing as easy and transparent as possible. Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol) for the protocol specification
- All our [contributors](https://github.com/ViezeVingertjes/example-async-mcp/graphs/contributors)

---

<p align="center">
  Made with ❤️ by the MCP community
</p> 