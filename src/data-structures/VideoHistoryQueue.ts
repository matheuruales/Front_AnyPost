/**
 * VideoHistoryQueue - Queue data structure for managing video loading batches
 * Implements FIFO (First In First Out) pattern for paginated video loading
 */
export class VideoHistoryQueue<T> {
  private items: T[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  /**
   * Add item to the end of the queue
   */
  enqueue(item: T): void {
    if (this.items.length >= this.maxSize) {
      this.dequeue(); // Remove oldest item if queue is full
    }
    this.items.push(item);
  }

  /**
   * Remove and return the first item from the queue
   */
  dequeue(): T | undefined {
    return this.items.shift();
  }

  /**
   * Get the first item without removing it
   */
  peek(): T | undefined {
    return this.items[0];
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get current size of the queue
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Clear all items from the queue
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Get all items as array
   */
  toArray(): T[] {
    return [...this.items];
  }

  /**
   * Add multiple items at once
   */
  enqueueBatch(items: T[]): void {
    items.forEach(item => this.enqueue(item));
  }
}

