
import { GoogleServiceAdapter } from '../google-adapter';

export interface NewEmailReceivedConfig {
  query?: string;
  labelIds?: string[];
  hasAttachment?: boolean;
  subject?: string[];
  minSize?: number;
  checkInterval?: number;
}

export interface NewEmailReceivedOutput {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  body: string;
  labelIds: string[];
  hasAttachment: boolean;
  size?: number;
}

export const newEmailReceivedSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Gmail search query (e.g., "is:unread", "from:example@gmail.com", "subject:urgent")',
      examples: [
        'is:unread',
        'from:boss@company.com',
        'subject:urgent',
        'has:attachment',
        'after:2024/01/01',
        'label:important'
      ]
    },
    labelIds: {
      type: 'array',
      description: 'Filter by specific label IDs',
      items: {
        type: 'string',
        enum: ['INBOX', 'UNREAD', 'STARRED', 'IMPORTANT', 'SENT', 'DRAFT', 'TRASH', 'SPAM']
      },
      examples: [['INBOX', 'UNREAD'], ['IMPORTANT']]
    },
    hasAttachment: {
      type: 'boolean',
      description: 'Only trigger for emails with attachments',
      default: false
    },
    subject: {
      type: 'array',
      description: 'Keywords to search in subject (case-insensitive)',
      items: {
        type: 'string',
        minLength: 1
      },
      examples: [['invoice', 'bill'], ['urgent', 'asap']]
    },
    minSize: {
      type: 'number',
      description: 'Minimum email size in bytes',
      minimum: 0,
      examples: [1024, 10240]
    },
    checkInterval: {
      type: 'number',
      description: 'Check interval in seconds (default: 60)',
      minimum: 30,
      maximum: 3600,
      default: 60
    }
  },
  additionalProperties: false
};

export class NewEmailReceivedAction {
  private lastCheckTimestamp: Map<string, Date> = new Map();
  private processedEmails: Set<string> = new Set();

  constructor(private adapter: GoogleServiceAdapter) {}

  async check(config: NewEmailReceivedConfig): Promise<NewEmailReceivedOutput[]> {
    const lastCheck = this.lastCheckTimestamp.get(this.getCacheKey(config)) || new Date(Date.now() - 60000);

    try {
      let query = this.buildQuery(config, lastCheck);

      console.log(`[NewEmailReceived] Checking with query: ${query}`);

      const response = await this.adapter.listEmails({
        maxResults: 50,
        query,
        labelIds: config.labelIds
      });

      if (!response.messages || response.messages.length === 0) {
        console.log('[NewEmailReceived] No new emails found');
        this.lastCheckTimestamp.set(this.getCacheKey(config), new Date());
        return [];
      }

      console.log(`[NewEmailReceived] Found ${response.messages.length} potential emails`);

      const results: NewEmailReceivedOutput[] = [];

      for (const message of response.messages) {
        if (this.processedEmails.has(message.id)) {
          continue;
        }

        try {
          const email = await this.adapter.getEmail(message.id);

          if (!this.matchesFilters(email, config)) {
            continue;
          }

          this.processedEmails.add(message.id);

          results.push({
            id: email.id,
            threadId: email.threadId,
            subject: email.subject,
            from: email.from,
            to: email.to,
            date: email.date,
            snippet: email.snippet,
            body: email.body,
            labelIds: email.labelIds,
            hasAttachment: this.hasAttachments(email),
            size: email.body.length
          });

        } catch (error: any) {
          console.error(`[NewEmailReceived] Error processing email ${message.id}:`, error.message);
        }
      }

      this.lastCheckTimestamp.set(this.getCacheKey(config), new Date());

      if (results.length > 0) {
        console.log(`[NewEmailReceived] Triggering ${results.length} actions`);
      }

      return results;

    } catch (error: any) {
      console.error('[NewEmailReceived] Error checking emails:', error.message);
      throw error;
    }
  }

  private buildQuery(config: NewEmailReceivedConfig, lastCheck: Date): string {
    const queries: string[] = [];

    if (config.query) {
      queries.push(config.query);
    }

    const dateStr = this.formatGmailDate(lastCheck);
    queries.push(`after:${dateStr}`);

    if (config.hasAttachment) {
      queries.push('has:attachment');
    }

    if (config.subject && config.subject.length > 0) {
      const subjectQuery = config.subject.map(kw => `subject:${kw}`).join(' OR ');
      queries.push(`(${subjectQuery})`);
    }

    if (config.minSize) {
      queries.push(`size:${config.minSize}`);
    }

    return queries.join(' ');
  }

  private matchesFilters(email: any, config: NewEmailReceivedConfig): boolean {
    if (config.hasAttachment && !this.hasAttachments(email)) {
      return false;
    }

    if (config.subject && config.subject.length > 0) {
      const subject = email.subject.toLowerCase();
      const hasKeyword = config.subject.some(kw => subject.includes(kw.toLowerCase()));
      if (!hasKeyword) {
        return false;
      }
    }

    if (config.minSize && email.body.length < config.minSize) {
      return false;
    }

    return true;
  }

  private hasAttachments(email: any): boolean {
    return email.labelIds?.includes('ATTACHMENT') || false;
  }

  private formatGmailDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  private getCacheKey(config: NewEmailReceivedConfig): string {
    return JSON.stringify({
      query: config.query,
      labelIds: config.labelIds,
      hasAttachment: config.hasAttachment,
      subject: config.subject
    });
  }

  validateConfig(config: any): config is NewEmailReceivedConfig {
    if (config.checkInterval !== undefined) {
      if (typeof config.checkInterval !== 'number' || config.checkInterval < 30) {
        throw new Error('checkInterval must be a number >= 30 seconds');
      }
    }

    if (config.minSize !== undefined && typeof config.minSize !== 'number') {
      throw new Error('minSize must be a number');
    }

    if (config.labelIds !== undefined && !Array.isArray(config.labelIds)) {
      throw new Error('labelIds must be an array');
    }

    if (config.subject !== undefined && !Array.isArray(config.subject)) {
      throw new Error('subject must be an array');
    }

    return true;
  }

  cleanupCache(): void {
    if (this.processedEmails.size > 1000) {
      const entries = Array.from(this.processedEmails);
      this.processedEmails = new Set(entries.slice(-1000));
    }
  }

  static getMetadata() {
    return {
      id: 'google_new_email_received',
      name: 'New Email Received',
      description: 'Triggers when a new email is received in Gmail with optional filters',
      service: 'google',
      category: 'gmail',
      configSchema: newEmailReceivedSchema,
      outputExample: {
        id: '18c1f2a3b4d5e6f7',
        threadId: '18c1f2a3b4d5e6f7',
        subject: 'Important: Project Update',
        from: 'boss@company.com',
        to: 'me@example.com',
        date: 'Mon, 15 Jan 2024 10:30:00 +0000',
        snippet: 'Hi team, here is the latest update...',
        body: 'Full email content here...',
        labelIds: ['INBOX', 'UNREAD', 'IMPORTANT'],
        hasAttachment: true,
        size: 5420
      },
      requiredScopes: ['https:
    };
  }
}

setInterval(() => {
  console.log('[NewEmailReceived] Scheduled cache cleanup');
}, 60 * 60 * 1000);
