# Example Async MCP Server

A Model Context Protocol (MCP) server demonstrating asynchronous task processing with status tracking. This example shows how to implement long-running tasks in an MCP server with proper error handling, timeouts, and status updates.

## Features

- Asynchronous task processing
- Task status tracking and polling
- Automatic task cleanup
- Timeout handling
- Error handling with custom error types
- TypeScript support
- Proper resource management

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Starting the Server

```bash
npm start
```

### Using the MCP Inspector

```bash
npm run inspector
```

### Available Tools

#### 1. process_task

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

Parameters:
- `input` (string, required): The input string to process
- `delayMs` (number, optional): Processing delay in milliseconds (default: 5000)
- `timeoutMs` (number, optional): Task timeout in milliseconds (default: 30000)

Response:
```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### 2. check_task_status

Check the status of a task.

```json
{
  "name": "check_task_status",
  "arguments": {
    "taskId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

Parameters:
- `taskId` (string, required): The ID of the task to check

Response:
```json
{
  "status": "complete",
  "result": "!dlroW ,olleH"
}
```

Possible status values:
- `pending`: Task created but not started
- `processing`: Task is being processed
- `complete`: Task completed successfully
- `error`: Task failed

### Error Handling

The server includes proper error handling for various scenarios:

1. Task Not Found
```json
{
  "error": "No task found with ID: 550e8400-e29b-41d4-a716-446655440000",
  "code": "TASK_NOT_FOUND"
}
```

2. Task Timeout
```json
{
  "error": "Task 550e8400-e29b-41d4-a716-446655440000 timed out",
  "code": "TASK_TIMEOUT"
}
```

3. Maximum Tasks Exceeded
```json
{
  "error": "Maximum number of active tasks reached",
  "code": "INVALID_REQUEST"
}
```

## Configuration

Configuration constants in `src/constants.ts`:

```typescript
export const DEFAULT_TASK_TIMEOUT_MS = 30000; // 30 seconds
export const DEFAULT_TASK_DELAY_MS = 5000;    // 5 seconds
export const DEFAULT_POLL_DELAY_MS = 10000;   // 10 seconds
export const POLL_INTERVAL_MS = 100;          // 100ms
export const MAX_TASKS = 1000;               // Maximum concurrent tasks
```

## Development

### Project Structure

- `src/index.ts`: Main server implementation
- `src/types.ts`: TypeScript types and interfaces
- `src/constants.ts`: Configuration constants
- `src/utils.ts`: Utility functions

### Building

```bash
npm run build
```

### Watching for Changes

```bash
npm run watch
```

## License

MIT License. See [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 