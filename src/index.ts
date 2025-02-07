#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';

import {
  TaskStatus,
  TaskStatusEnum,
  TaskResponse,
  TaskStatusResponse,
  TaskTimeoutError,
  TaskNotFoundError,
  TaskError,
} from './types.js';
import {
  DEBUG,
  DEFAULT_TASK_DELAY_MS,
  DEFAULT_TASK_TIMEOUT_MS,
  DEFAULT_POLL_DELAY_MS,
  POLL_INTERVAL_MS,
  MAX_TASKS,
  SERVER_NAME,
  SERVER_VERSION,
} from './constants.js';
import {
  log,
  isValidProcessTaskArgs,
  isValidCheckTaskStatusArgs,
  sleep,
  cleanupTasks,
} from './utils.js';

class ExampleMcpServer {
  private server: Server;
  private activeTasks: Map<string, TaskStatus> = new Map();
  private cleanupInterval!: NodeJS.Timeout;

  constructor() {
    log('Initializing Example MCP Server...');
    
    // Initialize MCP server
    this.server = new Server(
      {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
    this.setupCleanup();
  }

  private setupErrorHandling(): void {
    // Error handling
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
      if (error instanceof TaskError) {
        throw new McpError(ErrorCode.InvalidRequest, error.message);
      }
      throw error;
    };

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private setupCleanup(): void {
    // Cleanup old tasks periodically
    this.cleanupInterval = setInterval(() => {
      cleanupTasks(this.activeTasks, DEFAULT_TASK_TIMEOUT_MS * 2);
    }, DEFAULT_TASK_TIMEOUT_MS);
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'process_task',
          description: 'Start processing a task asynchronously.',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'The input to process'
              },
              delayMs: {
                type: 'number',
                description: 'Optional delay in milliseconds to simulate processing time',
                default: DEFAULT_TASK_DELAY_MS
              },
              timeoutMs: {
                type: 'number',
                description: 'Optional timeout in milliseconds',
                default: DEFAULT_TASK_TIMEOUT_MS
              }
            },
            required: ['input']
          }
        },
        {
          name: 'check_task_status',
          description: 'Check the status of an async task',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'The task ID returned by process_task'
              }
            },
            required: ['taskId']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'process_task') {
        return this.handleProcessTask(request.params.arguments);
      } else if (request.params.name === 'check_task_status') {
        return this.handleCheckTaskStatus(request.params.arguments);
      } else {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }
    });
  }

  private async handleProcessTask(args: unknown): Promise<{ content: { type: string; text: string }[] }> {
    if (!isValidProcessTaskArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid process_task arguments'
      );
    }

    if (this.activeTasks.size >= MAX_TASKS) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Maximum number of active tasks reached'
      );
    }

    const taskId = uuidv4();
    const { input, delayMs = DEFAULT_TASK_DELAY_MS, timeoutMs = DEFAULT_TASK_TIMEOUT_MS } = args;

    // Initialize task status
    this.activeTasks.set(taskId, {
      status: TaskStatusEnum.Pending,
      timestamp: Date.now(),
      timeoutAt: Date.now() + timeoutMs
    });

    // Start processing in background
    this.processTask(taskId, input, delayMs).catch(error => {
      log('Error processing task:', error);
      this.activeTasks.set(taskId, {
        status: TaskStatusEnum.Error,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    });

    const response: TaskResponse = { taskId };
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response)
        }
      ]
    };
  }

  private async handleCheckTaskStatus(args: unknown): Promise<{ content: { type: string; text: string }[] }> {
    if (!isValidCheckTaskStatusArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid check_task_status arguments'
      );
    }

    const { taskId } = args;
    const task = this.activeTasks.get(taskId);

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    // Check for timeout
    if (task.timeoutAt && Date.now() > task.timeoutAt) {
      this.activeTasks.set(taskId, {
        ...task,
        status: TaskStatusEnum.Error,
        error: 'Task timed out'
      });
      throw new TaskTimeoutError(taskId);
    }

    // If task is in a final state, return immediately
    if ([TaskStatusEnum.Complete, TaskStatusEnum.Error].includes(task.status)) {
      const response: TaskStatusResponse = {
        status: task.status,
        result: task.result,
        error: task.error
      };
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response)
          }
        ]
      };
    }

    // Otherwise, wait for either a status change or timeout
    const initialStatus = task.status;
    
    try {
      await new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          const currentTask = this.activeTasks.get(taskId);
          if (!currentTask) {
            clearInterval(checkInterval);
            reject(new TaskNotFoundError(taskId));
            return;
          }

          // Check for timeout
          if (currentTask.timeoutAt && Date.now() > currentTask.timeoutAt) {
            clearInterval(checkInterval);
            this.activeTasks.set(taskId, {
              ...currentTask,
              status: TaskStatusEnum.Error,
              error: 'Task timed out'
            });
            reject(new TaskTimeoutError(taskId));
            return;
          }

          // Resolve if status changed or reached final state
          if (currentTask.status !== initialStatus || 
              [TaskStatusEnum.Complete, TaskStatusEnum.Error].includes(currentTask.status)) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, POLL_INTERVAL_MS);

        // Set timeout to resolve after poll delay
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, DEFAULT_POLL_DELAY_MS);
      });
    } catch (error) {
      if (error instanceof TaskError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InvalidRequest,
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }

    // Get final task state after waiting
    const finalTask = this.activeTasks.get(taskId);
    if (!finalTask) {
      throw new TaskNotFoundError(taskId);
    }

    const response: TaskStatusResponse = {
      status: finalTask.status,
      result: finalTask.result,
      error: finalTask.error
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response)
        }
      ]
    };
  }

  private async processTask(taskId: string, input: string, delayMs: number): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    try {
      // Update status to processing
      this.activeTasks.set(taskId, {
        ...task,
        status: TaskStatusEnum.Processing
      });

      // Simulate some async processing
      await sleep(delayMs);

      // Check for timeout
      if (task.timeoutAt && Date.now() > task.timeoutAt) {
        throw new TaskTimeoutError(taskId);
      }

      // Process the input (in this example, just reverse it)
      const result = input.split('').reverse().join('');

      // Update status to complete with result
      this.activeTasks.set(taskId, {
        status: TaskStatusEnum.Complete,
        result,
        timestamp: Date.now(),
        timeoutAt: task.timeoutAt
      });
    } catch (error) {
      // Update status to error
      this.activeTasks.set(taskId, {
        status: TaskStatusEnum.Error,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        timeoutAt: task.timeoutAt
      });
      throw error;
    }
  }

  private async cleanup(): Promise<void> {
    clearInterval(this.cleanupInterval);
    await this.server.close();
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    log('Example MCP server running on stdio');
  }
}

const server = new ExampleMcpServer();
server.run().catch(console.error);