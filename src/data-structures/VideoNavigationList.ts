/**
 * VideoNavigationList - Doubly Linked List for video navigation
 * Enables efficient forward/backward navigation between videos
 */
class VideoNode {
  video: any;
  prev: VideoNode | null = null;
  next: VideoNode | null = null;

  constructor(video: any) {
    this.video = video;
  }
}

export class VideoNavigationList {
  private head: VideoNode | null = null;
  private tail: VideoNode | null = null;
  private current: VideoNode | null = null;
  private size: number = 0;

  /**
   * Add video to the end of the list
   */
  append(video: any): void {
    const newNode = new VideoNode(video);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      this.current = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail!.next = newNode;
      this.tail = newNode;
    }

    this.size++;
  }

  /**
   * Add multiple videos at once
   */
  appendBatch(videos: any[]): void {
    videos.forEach(video => this.append(video));
  }

  /**
   * Get current video
   */
  getCurrent(): any | null {
    return this.current?.video || null;
  }

  /**
   * Move to next video
   */
  next(): any | null {
    if (this.current?.next) {
      this.current = this.current.next;
      return this.current.video;
    }
    return null;
  }

  /**
   * Move to previous video
   */
  previous(): any | null {
    if (this.current?.prev) {
      this.current = this.current.prev;
      return this.current.video;
    }
    return null;
  }

  /**
   * Move to specific video by ID
   */
  moveTo(videoId: string): boolean {
    let node = this.head;
    while (node) {
      if (node.video.id === videoId) {
        this.current = node;
        return true;
      }
      node = node.next;
    }
    return false;
  }

  /**
   * Check if there's a next video
   */
  hasNext(): boolean {
    return this.current?.next !== null;
  }

  /**
   * Check if there's a previous video
   */
  hasPrevious(): boolean {
    return this.current?.prev !== null;
  }

  /**
   * Get current position (0-indexed)
   */
  getCurrentPosition(): number {
    if (!this.current) {
      return -1;
    }

    let position = 0;
    let node = this.head;
    while (node && node !== this.current) {
      position++;
      node = node.next;
    }

    return position;
  }

  /**
   * Get total size
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Clear all videos
   */
  clear(): void {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  /**
   * Convert to array
   */
  toArray(): any[] {
    const result: any[] = [];
    let node = this.head;
    while (node) {
      result.push(node.video);
      node = node.next;
    }
    return result;
  }
}

