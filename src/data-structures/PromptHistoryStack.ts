/**
 * PromptHistoryStack - Stack data structure for managing prompt history
 * Implements LIFO (Last In First Out) pattern for prompt navigation
 */
export interface PromptEntry {
  id: string;
  prompt: string;
  size: string;
  quality: string;
  style: string;
  timestamp: number;
  imageUrl?: string;
}

export class PromptHistoryStack {
  private items: PromptEntry[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  /**
   * Push new prompt to the top of the stack
   */
  push(entry: PromptEntry): void {
    // Remove duplicate if exists
    this.items = this.items.filter(item => item.id !== entry.id);
    
    // Add to top
    this.items.unshift(entry);
    
    // Limit size
    if (this.items.length > this.maxSize) {
      this.items = this.items.slice(0, this.maxSize);
    }
  }

  /**
   * Pop and return the top prompt
   */
  pop(): PromptEntry | undefined {
    return this.items.shift();
  }

  /**
   * Get the top prompt without removing it
   */
  peek(): PromptEntry | undefined {
    return this.items[0];
  }

  /**
   * Get prompt by index
   */
  get(index: number): PromptEntry | undefined {
    return this.items[index];
  }

  /**
   * Get all prompts as array (newest first)
   */
  getAll(): PromptEntry[] {
    return [...this.items];
  }

  /**
   * Get prompts count
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Check if stack is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Clear all prompts
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Remove specific prompt by ID
   */
  remove(id: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    return this.items.length < initialLength;
  }
}

