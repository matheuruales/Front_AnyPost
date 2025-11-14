/**
 * VideoIndexMap - HashMap for fast video lookup and indexing
 * Provides O(1) access to videos by ID and efficient filtering
 */
export class VideoIndexMap {
  private byId: Map<string, any> = new Map();
  private byStatus: Map<string, Set<string>> = new Map();
  private byPlatform: Map<string, Set<string>> = new Map();
  private byTag: Map<string, Set<string>> = new Map();

  /**
   * Add video to index
   */
  addVideo(video: any): void {
    // Index by ID
    this.byId.set(video.id, video);

    // Index by status
    const status = video.status || 'unknown';
    if (!this.byStatus.has(status)) {
      this.byStatus.set(status, new Set());
    }
    this.byStatus.get(status)!.add(video.id);

    // Index by platform
    if (video.targetPlatforms && Array.isArray(video.targetPlatforms)) {
      video.targetPlatforms.forEach((platform: string) => {
        if (!this.byPlatform.has(platform)) {
          this.byPlatform.set(platform, new Set());
        }
        this.byPlatform.get(platform)!.add(video.id);
      });
    }

    // Index by tags
    if (video.tags && Array.isArray(video.tags)) {
      video.tags.forEach((tag: string) => {
        if (!this.byTag.has(tag)) {
          this.byTag.set(tag, new Set());
        }
        this.byTag.get(tag)!.add(video.id);
      });
    }
  }

  /**
   * Add multiple videos at once
   */
  addVideos(videos: any[]): void {
    videos.forEach(video => this.addVideo(video));
  }

  /**
   * Get video by ID
   */
  getById(id: string): any | undefined {
    return this.byId.get(id);
  }

  /**
   * Get videos by status
   */
  getByStatus(status: string): any[] {
    const ids = this.byStatus.get(status);
    if (!ids) {
      return [];
    }
    return Array.from(ids)
      .map(id => this.byId.get(id))
      .filter(video => video !== undefined);
  }

  /**
   * Get videos by platform
   */
  getByPlatform(platform: string): any[] {
    const ids = this.byPlatform.get(platform);
    if (!ids) {
      return [];
    }
    return Array.from(ids)
      .map(id => this.byId.get(id))
      .filter(video => video !== undefined);
  }

  /**
   * Get videos by tag
   */
  getByTag(tag: string): any[] {
    const ids = this.byTag.get(tag);
    if (!ids) {
      return [];
    }
    return Array.from(ids)
      .map(id => this.byId.get(id))
      .filter(video => video !== undefined);
  }

  /**
   * Search videos by text (title, content, tags)
   */
  search(query: string): any[] {
    const lowerQuery = query.toLowerCase();
    const results: Set<string> = new Set();

    this.byId.forEach((video, id) => {
      const titleMatch = video.title?.toLowerCase().includes(lowerQuery);
      const contentMatch = video.content?.toLowerCase().includes(lowerQuery);
      const tagMatch = video.tags?.some((tag: string) =>
        tag.toLowerCase().includes(lowerQuery)
      );

      if (titleMatch || contentMatch || tagMatch) {
        results.add(id);
      }
    });

    return Array.from(results)
      .map(id => this.byId.get(id))
      .filter(video => video !== undefined);
  }

  /**
   * Get all unique statuses
   */
  getAllStatuses(): string[] {
    return Array.from(this.byStatus.keys());
  }

  /**
   * Get all unique platforms
   */
  getAllPlatforms(): string[] {
    return Array.from(this.byPlatform.keys());
  }

  /**
   * Get all unique tags
   */
  getAllTags(): string[] {
    return Array.from(this.byTag.keys());
  }

  /**
   * Remove video from index
   */
  removeVideo(id: string): boolean {
    const video = this.byId.get(id);
    if (!video) {
      return false;
    }

    // Remove from all indexes
    this.byId.delete(id);

    this.byStatus.forEach((ids, status) => {
      ids.delete(id);
      if (ids.size === 0) {
        this.byStatus.delete(status);
      }
    });

    this.byPlatform.forEach((ids, platform) => {
      ids.delete(id);
      if (ids.size === 0) {
        this.byPlatform.delete(platform);
      }
    });

    this.byTag.forEach((ids, tag) => {
      ids.delete(id);
      if (ids.size === 0) {
        this.byTag.delete(tag);
      }
    });

    return true;
  }

  /**
   * Clear all indexes
   */
  clear(): void {
    this.byId.clear();
    this.byStatus.clear();
    this.byPlatform.clear();
    this.byTag.clear();
  }

  /**
   * Get total number of videos
   */
  getSize(): number {
    return this.byId.size;
  }
}

