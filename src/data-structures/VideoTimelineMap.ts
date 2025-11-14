/**
 * VideoTimelineMap - Tree-like structure for organizing videos by date
 * Groups videos by year-month for efficient timeline navigation
 */
export interface TimelineGroup {
  year: number;
  month: number;
  monthName: string;
  videos: any[];
}

export class VideoTimelineMap {
  private timeline: Map<string, TimelineGroup> = new Map();

  /**
   * Add video to timeline, grouped by year-month
   */
  addVideo(video: any): void {
    const date = new Date(video.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    const monthName = date.toLocaleString('en-US', { month: 'long' });

    if (!this.timeline.has(key)) {
      this.timeline.set(key, {
        year,
        month,
        monthName,
        videos: [],
      });
    }

    this.timeline.get(key)!.videos.push(video);
  }

  /**
   * Add multiple videos at once
   */
  addVideos(videos: any[]): void {
    videos.forEach(video => this.addVideo(video));
  }

  /**
   * Get timeline groups sorted by date (newest first)
   */
  getTimelineGroups(): TimelineGroup[] {
    return Array.from(this.timeline.values())
      .sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year; // Newest year first
        }
        return b.month - a.month; // Newest month first
      });
  }

  /**
   * Get videos for a specific year-month
   */
  getVideosByMonth(year: number, month: number): any[] {
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    return this.timeline.get(key)?.videos || [];
  }

  /**
   * Get total number of videos
   */
  getTotalVideos(): number {
    let total = 0;
    this.timeline.forEach(group => {
      total += group.videos.length;
    });
    return total;
  }

  /**
   * Get number of months with videos
   */
  getMonthCount(): number {
    return this.timeline.size;
  }

  /**
   * Clear all timeline data
   */
  clear(): void {
    this.timeline.clear();
  }

  /**
   * Get date range (earliest and latest dates)
   */
  getDateRange(): { earliest: Date | null; latest: Date | null } {
    if (this.timeline.size === 0) {
      return { earliest: null, latest: null };
    }

    let earliest: Date | null = null;
    let latest: Date | null = null;

    this.timeline.forEach(group => {
      group.videos.forEach(video => {
        const date = new Date(video.createdAt);
        if (!earliest || date < earliest) {
          earliest = date;
        }
        if (!latest || date > latest) {
          latest = date;
        }
      });
    });

    return { earliest, latest };
  }
}

