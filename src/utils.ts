import { DEBUG, COMPLETED_TASK_RETENTION_MS } from './constants.js';
import { ProcessTaskArgs, CheckTaskStatusArgs, TaskStatus, TaskStatusEnum } from './types.js';

type LogArgs = string | number | boolean | null | undefined;
type LogLevel = 'INFO' | 'ERROR' | 'DEBUG' | 'WARN';

const logMessage = (
  level: LogLevel,
  context: string,
  message: string,
  ...args: LogArgs[]
): void => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level}] [${context}] ${message}`;

  switch (level) {
    case 'ERROR':
      console.error(formattedMessage, ...args);
      break;
    case 'WARN':
      console.warn(formattedMessage, ...args);
      break;
    default:
      // Only DEBUG and INFO use console.log
      if (level === 'DEBUG' || level === 'INFO') {
        console.warn(formattedMessage, ...args);
      }
  }
};

export const logger = {
  info: (context: string, message: string, ...args: LogArgs[]): void => {
    logMessage('INFO', context, message, ...args);
  },
  error: (context: string, message: string, ...args: LogArgs[]): void => {
    logMessage('ERROR', context, message, ...args);
  },
  debug: (context: string, message: string, ...args: LogArgs[]): void => {
    if (DEBUG) {
      logMessage('DEBUG', context, message, ...args);
    }
  },
  warn: (context: string, message: string, ...args: LogArgs[]): void => {
    logMessage('WARN', context, message, ...args);
  },
};

export const isValidProcessTaskArgs = (args: unknown): args is ProcessTaskArgs => {
  const candidate = args as ProcessTaskArgs;
  return (
    typeof args === 'object' &&
    args !== null &&
    typeof candidate.input === 'string' &&
    (candidate.delayMs === undefined || typeof candidate.delayMs === 'number') &&
    (candidate.timeoutMs === undefined || typeof candidate.timeoutMs === 'number')
  );
};

export const isValidCheckTaskStatusArgs = (args: unknown): args is CheckTaskStatusArgs => {
  const candidate = args as CheckTaskStatusArgs;
  return typeof args === 'object' && args !== null && typeof candidate.taskId === 'string';
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const cleanupTasks = (tasks: Map<string, TaskStatus>, maxAge: number): void => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [id, task] of tasks.entries()) {
    const age = now - task.timestamp;

    // For completed tasks, use the longer retention time
    const taskMaxAge =
      task.status === TaskStatusEnum.Complete ? COMPLETED_TASK_RETENTION_MS : maxAge;

    if (age > taskMaxAge) {
      logger.debug('Cleanup', `Removing ${task.status} task ${id} (age: ${age}ms)`);
      tasks.delete(id);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    logger.info('Cleanup', `Removed ${cleanedCount} stale tasks`);
  }
};
