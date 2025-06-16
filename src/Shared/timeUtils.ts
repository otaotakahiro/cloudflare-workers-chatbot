import type { TimeAwareEvent, TimePeriod, TimeRecognitionUtils } from './types';

/**
 * 時系列認識ユーティリティクラス
 * 日本語の日付表現を解析し、現在時点での時期分類を行います
 */
export class TimeRecognition implements TimeRecognitionUtils {

  /**
   * 日本語の日付文字列をDateオブジェクトに変換
   */
  parseDate(dateString: string): Date | null {
    try {
      // 様々な日本語日付フォーマットに対応
      const cleanDate = dateString
        .replace(/年/g, '-')
        .replace(/月/g, '-')
        .replace(/日/g, '')
        .replace(/\s+/g, '')
        .replace(/：/g, ':');

      // YYYY年MM月DD日形式
      const yearMonthDayMatch = cleanDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (yearMonthDayMatch) {
        const [, year, month, day] = yearMonthDayMatch;
        if (year && month && day) {
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }

      // YYYY年MM月形式（日を1日として扱う）
      const yearMonthMatch = cleanDate.match(/(\d{4})-(\d{1,2})/);
      if (yearMonthMatch) {
        const [, year, month] = yearMonthMatch;
        if (year && month) {
          return new Date(parseInt(year), parseInt(month) - 1, 1);
        }
      }

      // MM月DD日形式（今年として扱う）
      const monthDayMatch = cleanDate.match(/(\d{1,2})-(\d{1,2})/);
      if (monthDayMatch) {
        const [, month, day] = monthDayMatch;
        if (month && day) {
          const currentYear = new Date().getFullYear();
          return new Date(currentYear, parseInt(month) - 1, parseInt(day));
        }
      }

      // 標準的なISO形式や一般的な形式も試す
      const standardDate = new Date(dateString);
      if (!isNaN(standardDate.getTime())) {
        return standardDate;
      }

      return null;
    } catch (error) {
      console.warn(`Failed to parse date: ${dateString}`, error);
      return null;
    }
  }

  /**
   * 日付から時期（過去・現在・未来）を判定
   */
  determineTimePeriod(date: string, currentDate: Date = new Date()): TimePeriod {
    const eventDate = this.parseDate(date);
    if (!eventDate) {
      return 'current'; // パースできない場合は現在として扱う
    }

    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    const timeDiff = eventDateOnly.getTime() - today.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < -7) return 'past';      // 1週間以上前
    if (daysDiff > 7) return 'future';     // 1週間以上後
    return 'current';                      // 現在（±1週間以内）
  }

  /**
   * イベントが現在進行中かどうかを判定
   */
  isEventActive(event: TimeAwareEvent, currentDate: Date = new Date()): boolean {
    const startDate = this.parseDate(event.date);
    if (!startDate) return false;

    const endDate = ('endDate' in event && event.endDate) ?
      this.parseDate(event.endDate as string) : startDate;
    if (!endDate) return false;

    return currentDate >= startDate && currentDate <= endDate;
  }

  /**
   * イベントが終了済みかどうかを判定
   */
  hasEventEnded(event: TimeAwareEvent, currentDate: Date = new Date()): boolean {
    const endDate = ('endDate' in event && event.endDate) ?
      this.parseDate(event.endDate as string) : this.parseDate(event.date);
    if (!endDate) return false;

    // 終了日の23:59:59まで有効とする
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    return currentDate > endOfDay;
  }

  /**
   * チャット用の日付フォーマット（時期に応じた表現）
   */
  formatDateForChat(date: string, timePeriod: TimePeriod): string {
    const eventDate = this.parseDate(date);
    if (!eventDate) return date;

    const year = eventDate.getFullYear();
    const month = eventDate.getMonth() + 1;
    const day = eventDate.getDate();

    switch (timePeriod) {
      case 'past':
        return `${year}年${month}月${day}日（終了済み）`;
      case 'current':
        return `${year}年${month}月${day}日（現在）`;
      case 'future':
        return `${year}年${month}月${day}日（予定）`;
      default:
        return `${year}年${month}月${day}日`;
    }
  }

  /**
   * イベント配列を時期別に分類（現在時刻を動的に指定可能）
   */
  categorizeEventsByTime(events: TimeAwareEvent[], currentDate: Date = new Date()): {
    past: TimeAwareEvent[];
    current: TimeAwareEvent[];
    future: TimeAwareEvent[];
  } {
    const result = {
      past: [] as TimeAwareEvent[],
      current: [] as TimeAwareEvent[],
      future: [] as TimeAwareEvent[]
    };

    events.forEach(event => {
      const timePeriod = this.determineTimePeriod(event.date, currentDate);
      const isEnded = this.hasEventEnded(event, currentDate);

      // イベントの時系列情報を自動計算して付与
      event.timePeriod = timePeriod;
      event.isActive = this.isEventActive(event, currentDate);
      event.hasEnded = isEnded;

      if (isEnded || timePeriod === 'past') {
        result.past.push(event);
      } else if (timePeriod === 'future') {
        result.future.push(event);
      } else {
        result.current.push(event);
      }
    });

    return result;
  }

  /**
   * 時系列を考慮したプロンプト用テキスト生成（現在時刻を動的に指定可能）
   */
  generateTimeAwarePrompt(events: TimeAwareEvent[], category: string, currentDate: Date = new Date()): string {
    const { past, current, future } = this.categorizeEventsByTime(events, currentDate);

    let prompt = '';

    if (past.length > 0) {
      prompt += `【過去の${category}（終了済み）】\n`;
      prompt += past.map(event =>
        `- ${this.formatDateForChat(event.date, 'past')}: ${this.getEventTitle(event)}`
      ).join('\n') + '\n\n';
    }

    if (current.length > 0) {
      prompt += `【現在の${category}（進行中）】\n`;
      prompt += current.map(event =>
        `- ${this.formatDateForChat(event.date, 'current')}: ${this.getEventTitle(event)}`
      ).join('\n') + '\n\n';
    }

    if (future.length > 0) {
      prompt += `【今後の${category}（予定）】\n`;
      prompt += future.map(event =>
        `- ${this.formatDateForChat(event.date, 'future')}: ${this.getEventTitle(event)}`
      ).join('\n') + '\n\n';
    }

    return prompt;
  }

  /**
   * イベントのタイトルを取得（型に応じて）
   */
  private getEventTitle(event: TimeAwareEvent): string {
    if ('title' in event) {
      return event.title as string;
    }
    if ('content' in event) {
      return event.content as string;
    }
    if ('topic' in event) {
      return event.topic as string;
    }
    return 'イベント';
  }
}

// シングルトンインスタンス
export const timeRecognition = new TimeRecognition();
