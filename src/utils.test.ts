import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sleep, cleanupTasks, isValidProcessTaskArgs, isValidCheckTaskStatusArgs } from './utils';
import { TaskStatusEnum } from './types';

describe('Utils', () => {
  describe('sleep', () => {
    it('should wait for the specified time', async () => {
      const start = Date.now();
      const delay = 100;
      await sleep(delay);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(delay);
    });
  });

  describe('cleanupTasks', () => {
    let tasks: Map<string, any>;

    beforeEach(() => {
      tasks = new Map();
      vi.useFakeTimers();
    });

    it('should remove expired tasks', () => {
      const now = Date.now();
      tasks.set('task1', { timestamp: now - 2000 });
      tasks.set('task2', { timestamp: now - 1000 });
      tasks.set('task3', { timestamp: now });

      cleanupTasks(tasks, 1500);

      expect(tasks.has('task1')).toBe(false);
      expect(tasks.has('task2')).toBe(true);
      expect(tasks.has('task3')).toBe(true);
    });
  });

  describe('isValidProcessTaskArgs', () => {
    it('should validate correct process task arguments', () => {
      const validArgs = {
        input: 'test input',
        delayMs: 1000,
        timeoutMs: 5000
      };
      expect(isValidProcessTaskArgs(validArgs)).toBe(true);
    });

    it('should validate minimal process task arguments', () => {
      const minimalArgs = {
        input: 'test input'
      };
      expect(isValidProcessTaskArgs(minimalArgs)).toBe(true);
    });

    it('should reject invalid process task arguments', () => {
      const invalidArgs = {
        delayMs: 1000,
        timeoutMs: 5000
      };
      expect(isValidProcessTaskArgs(invalidArgs)).toBe(false);
    });
  });

  describe('isValidCheckTaskStatusArgs', () => {
    it('should validate correct check task status arguments', () => {
      const validArgs = {
        taskId: '123e4567-e89b-12d3-a456-426614174000'
      };
      expect(isValidCheckTaskStatusArgs(validArgs)).toBe(true);
    });

    it('should reject invalid check task status arguments', () => {
      const invalidArgs = {
        taskId: 123
      };
      expect(isValidCheckTaskStatusArgs(invalidArgs)).toBe(false);
    });
  });
}); 