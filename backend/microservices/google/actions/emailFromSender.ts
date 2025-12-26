
import { GoogleServiceAdapter } from '../google-adapter';

export interface EmailFromSenderConfig {
  senders: string[];
  matchType?: 'exact' | 'domain' | 'contains';
  subject?: string[];
  priority?: 'high' | 'normal' | 'low';
  excludeAutoReply?: boolean;
  labelIds?: string[];
  checkInterval?: number;
}

export interface EmailFromSenderOutput {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  cc?: string;
  date: string;
  snippet: string;
  body: string;
  labelIds: string[];
  priority: 'high' | 'normal' | 'low';
  isAutoReply: boolean;
  hasAttachment: boolean;
}

export const emailFromSenderSchema = {
  type: 'object',
  required: ['senders'],
  properties: {
    senders: {
      type: 'array',
      description: 'List of sender emails or domains to monitor',
      items: {
        type: 'string',
        format: 'email-or-domain'
      },
      minItems: 1,
      examples: [
        ['boss@company.com'],
        ['@clients.com', '@partners.com'],
        ['important@vendor.com', 'urgent@supplier.com']
      ]
    },
    matchType: {
      type: 'string',
      description: 'How to match sender addresses',
      enum: ['exact', 'domain', 'contains'],
      default: 'exact',
      examples: ['exact', 'domain', 'contains']
    },
    subject: {
      type: 'array',
      description: 'Keywords to search in subject (case-insensitive)',
      items: {
        type: 'string',
        minLength: 1
      },
      examples: [['urgent', 'asap'], ['invoice', 'bill'], ['meeting', 'calendar']]
    },
    priority: {
      type: 'string',
      description: 'Filter by email priority',
      enum: ['high', 'normal', 'low']
    },
    excludeAutoReply: {
      type: 'boolean',
      description: 'Exclude automatic replies and out-of-office messages',
      default: false
    },
    labelIds: {
      type: 'array',
      description: 'Additional Gmail label filters',
      items: {
        type: 'string'
      },
      examples: [['INBOX'], ['IMPORTANT', 'UNREAD']]
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

export class EmailFromSenderAction {
  private lastCheckTimestamp: Date = new Date(Date.now() - 60000);
  private processedEmails: Set<string> = new Set();

  constructor(private adapter: GoogleServiceAdapter) {}

  async check(config: EmailFromSenderConfig): Promise<EmailFromSenderOutput[]> {
    try {
      const senderQueries = this.buildSenderQueries(config.senders, config.matchType || 'exact');

      let query = `(${senderQueries.join(' OR ')})`;

      const dateStr = this.formatGmailDate(this.lastCheckTimestamp);
      query += ` after:${dateStr}`;

      if (config.subject && config.subject.length > 0) {
        const subjectQuery = config.subject.map(kw => `subject:${kw}`).join(' OR ');
        query += ` (${subjectQuery})`;
      }

      console.log(`[EmailFromSender] Checking with query: ${query}`);

      const response = await this.adapter.listEmails({
        maxResults: 50,
        query,
        labelIds: config.labelIds
      });

      if (!response.messages || response.messages.length === 0) {
        console.log('[EmailFromSender] No new emails found');
        this.lastCheckTimestamp = new Date();
        return [];
      }

      console.log(`[EmailFromSender] Found ${response.messages.length} potential emails`);

      const results: EmailFromSenderOutput[] = [];

      for (const message of response.messages) {
        if (this.processedEmails.has(message.id)) {
          continue;
        }

        try {
          const email = await this.adapter.getEmail(message.id);

          if (!this.senderMatches(email.from, config.senders, config.matchType || 'exact')) {
            continue;
          }

          if (config.excludeAutoReply && this.isAutoReply(email)) {
            console.log(`[EmailFromSender] Skipping auto-reply from ${email.from}`);
            continue;
          }

          const priority = this.detectPriority(email);
          if (config.priority && priority !== config.priority) {
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
            priority,
            isAutoReply: this.isAutoReply(email),
            hasAttachment: email.labelIds?.includes('ATTACHMENT') || false
          });

        } catch (error: any) {
          console.error(`[EmailFromSender] Error processing email ${message.id}:`, error.message);
        }
      }

      this.lastCheckTimestamp = new Date();

      if (results.length > 0) {
        console.log(`[EmailFromSender] Triggering ${results.length} actions`);
      }

      return results;

    } catch (error: any) {
      console.error('[EmailFromSender] Error checking emails:', error.message);
      throw error;
    }
  }

  private buildSenderQueries(senders: string[], matchType: string): string[] {
    return senders.map(sender => {
      switch (matchType) {
        case 'exact':
          return `from:${sender}`;
        case 'domain':
          const domain = sender.startsWith('@') ? sender : `@${sender.split('@')[1]}`;
          return `from:${domain}`;
        case 'contains':
          return `from:${sender}`;
        default:
          return `from:${sender}`;
      }
    });
  }

  private senderMatches(from: string, senders: string[], matchType: string): boolean {
    const emailMatch = from.match(/<(.+?)>/);
    const email = (emailMatch ? emailMatch[1] : from).toLowerCase();

    for (const sender of senders) {
      const senderLower = sender.toLowerCase();

      switch (matchType) {
        case 'exact':
          if (email === senderLower) return true;
          break;
        case 'domain':
          const domain = sender.startsWith('@') ? senderLower : `@${senderLower.split('@')[1]}`;
          if (email.endsWith(domain.substring(1))) return true;
          break;
        case 'contains':
          if (email.includes(senderLower) || from.toLowerCase().includes(senderLower)) {
            return true;
          }
          break;
      }
    }

    return false;
  }

  private isAutoReply(email: any): boolean {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();

    const autoReplyIndicators = [
      'auto-reply',
      'automatic reply',
      'out of office',
      'out-of-office',
      'away from office',
      'vacation',
      'away message',
      'automated response',
      'do not reply'
    ];

    return autoReplyIndicators.some(indicator =>
      subject.includes(indicator) || body.includes(indicator)
    );
  }

  private detectPriority(email: any): 'high' | 'normal' | 'low' {
    if (email.labelIds?.includes('IMPORTANT')) {
      return 'high';
    }

    const subject = email.subject.toLowerCase();
    const highPriorityKeywords = ['urgent', 'asap', 'critical', 'emergency', 'important'];
    const lowPriorityKeywords = ['fyi', 'for your information'];

    if (highPriorityKeywords.some(kw => subject.includes(kw))) {
      return 'high';
    }

    if (lowPriorityKeywords.some(kw => subject.includes(kw))) {
      return 'low';
    }

    return 'normal';
  }

  private formatGmailDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  validateConfig(config: any): config is EmailFromSenderConfig {
    if (!config.senders || !Array.isArray(config.senders) || config.senders.length === 0) {
      throw new Error('senders is required and must be a non-empty array');
    }

    if (config.matchType && !['exact', 'domain', 'contains'].includes(config.matchType)) {
      throw new Error('matchType must be "exact", "domain", or "contains"');
    }

    if (config.priority && !['high', 'normal', 'low'].includes(config.priority)) {
      throw new Error('priority must be "high", "normal", or "low"');
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
      id: 'google_email_from_sender',
      name: 'Email from Specific Sender',
      description: 'Triggers when an email is received from specific senders or domains',
      service: 'google',
      category: 'gmail',
      configSchema: emailFromSenderSchema,
      outputExample: {
        id: '18c1f2a3b4d5e6f7',
        threadId: '18c1f2a3b4d5e6f7',
        subject: 'Urgent: Server Down',
        from: 'boss@company.com',
        to: 'me@example.com',
        date: 'Mon, 15 Jan 2024 10:30:00 +0000',
        snippet: 'Our production server is down...',
        body: 'Full email content...',
        labelIds: ['INBOX', 'UNREAD', 'IMPORTANT'],
        priority: 'high',
        isAutoReply: false,
        hasAttachment: false
      },
      requiredScopes: ['https:
    };
  }
}
