import { DEBUG } from './constants.js';
import { ProcessTaskArgs, CheckTaskStatusArgs } from './types.js';

export const log = (...args: any[]): void => {
  if (DEBUG) {
    console.error('[EXAMPLE MCP]', ...args);
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
  for (const [id, task] of tasks.entries()) {
    if (now - task.timestamp > maxAge) {
      tasks.delete(id);
    }
  }
}; 