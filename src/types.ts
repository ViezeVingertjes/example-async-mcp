/** Status enum for task lifecycle states */
export enum TaskStatusEnum {
  /** Task has been created but not started */
  Pending = 'pending',
  /** Task is currently being processed */
  Processing = 'processing',
  /** Task has completed successfully */
  Complete = 'complete',
  /** Task encountered an error */
  Error = 'error',
}

/** Represents the current state of a task */
export interface TaskStatus {
  /** Current status of the task */
  status: TaskStatusEnum;
  /** Result of the task if completed successfully */
  result?: string;
  /** Error message if task failed */
  error?: string;
  /** Timestamp when the task was last updated */
  timestamp: number;
  /** Timestamp when the task should timeout */
  timeoutAt?: number;
}

/** Arguments for creating a new task */
export interface ProcessTaskArgs {
  /** Input string to process */
  input: string;
  /** Optional delay in milliseconds to simulate processing time */
  delayMs?: number;
  /** Optional timeout in milliseconds after which the task should fail */
  timeoutMs?: number;
}

/** Arguments for checking task status */
export interface CheckTaskStatusArgs {
  /** ID of the task to check */
  taskId: string;
}

/** Response when creating a new task */
export interface TaskResponse {
  /** ID of the created task */
  taskId: string;
}

/** Response when checking task status */
export interface TaskStatusResponse {
  /** Current status of the task */
  status: TaskStatusEnum;
  /** Result if task completed successfully */
  result?: string;
  /** Error message if task failed */
  error?: string;
}

/** Base class for task-related errors */
export class TaskError extends Error {
  /**
   * Creates a new TaskError
   * @param message - Error message
   * @param code - Error code for categorizing the error
   */
  constructor(
    message: string,
    public code: string = 'TASK_ERROR'
  ) {
    super(message);
    this.name = 'TaskError';
  }
}

/** Error thrown when a task times out */
export class TaskTimeoutError extends TaskError {
  /**
   * Creates a new TaskTimeoutError
   * @param taskId - ID of the task that timed out
   */
  constructor(taskId: string) {
    super(`Task ${taskId} timed out`, 'TASK_TIMEOUT');
    this.name = 'TaskTimeoutError';
  }
}

/** Error thrown when a task cannot be found */
export class TaskNotFoundError extends TaskError {
  /**
   * Creates a new TaskNotFoundError
   * @param taskId - ID of the task that was not found
   */
  constructor(taskId: string) {
    super(`No task found with ID: ${taskId}`, 'TASK_NOT_FOUND');
    this.name = 'TaskNotFoundError';
  }
}
