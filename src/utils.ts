import { DEBUG } from './constants.js';
import { ProcessTaskArgs, CheckTaskStatusArgs } from './types.js';

export const logger = {
  info: (context: string, message: string, ...args: any[]): void => {
    console.log(`[${new Date().toISOString()}] [INFO] [${context}] ${message}`, ...args);
  },
  error: (context: string, message: string, ...args: any[]): void => {
    console.error(`[${new Date().toISOString()}] [ERROR] [${context}] ${message}`, ...args);
  },
  debug: (context: string, message: string, ...args: any[]): void => {
    if (DEBUG) {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [${context}] ${message}`, ...args);
    }
  },
  warn: (context: string, message: string, ...args: any[]): void => {
    console.warn(`[${new Date().toISOString()}] [WARN] [${context}] ${message}`, ...args);
  }
};

export const isValidProcessTaskArgs = (args: any): args is ProcessTaskArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  (args.delayMs === undefined || typeof args.delayMs === 'number') &&
  (args.timeoutMs === undefined || typeof args.timeoutMs === 'number');

export const isValidCheckTaskStatusArgs = (args: any): args is CheckTaskStatusArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.taskId === 'string';

export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const cleanupTasks = <T>(
  tasks: Map<string, T & { timestamp: number }>,
  maxAge: number
): void => {
  const now = Date.now();
  let cleanedCount = 0;
  for (const [id, task] of tasks.entries()) {
    if (now - task.timestamp > maxAge) {
      logger.debug('Cleanup', `Removing stale task ${id}`);
      tasks.delete(id);
      cleanedCount++;
    }
  }
  if (cleanedCount > 0) {
    logger.info('Cleanup', `Removed ${cleanedCount} stale tasks`);
  }
}; 
