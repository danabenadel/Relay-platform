
import { GoogleServiceAdapter } from '../google-adapter';

export interface EmailWithAttachmentConfig {
  from?: string;
  fileTypes?: string[];
  minFileSize?: number;
  maxFileSize?: number;
  filenamePattern?: string;
  downloadAttachments?: boolean;
  checkInterval?: number;
}

export interface EmailWithAttachmentOutput {
  emailId: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
    content?: string;
  }>;
  totalAttachmentSize: number;
  attachmentCount: number;
}

export const emailWithAttachmentSchema = {
  type: 'object',
  properties: {
    from: {
      type: 'string',
      description: 'Filter by sender email or domain (e.g., "user@example.com" or "@company.com")',
      examples: ['boss@company.com', '@clients.com', 'invoices@vendor.com']
    },
    fileTypes: {
      type: 'array',
      description: 'Filter by file extensions',
      items: {
        type: 'string',
        pattern: '^[a-zA-Z0-9]+$'
      },
      examples: [['pdf', 'docx'], ['jpg', 'png', 'gif'], ['zip', 'rar']]
    },
    minFileSize: {
      type: 'number',
      description: 'Minimum attachment size in bytes',
      minimum: 0,
      examples: [1024, 10240, 1048576]
    },
    maxFileSize: {
      type: 'number',
      description: 'Maximum attachment size in bytes',
      minimum: 0,
      examples: [10485760, 52428800]
    },
    filenamePattern: {
      type: 'string',
      description: 'Regex pattern for filename matching',
      examples: ['^invoice-.*\\.pdf$', '.*report.*', '^\\d{4}-\\d{2}-\\d{2}.*']
    },
    downloadAttachments: {
      type: 'boolean',
      description: 'Download attachment content (increases processing time)',
      default: false
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

export class EmailWithAttachmentAction {
  private lastCheckTimestamp: Date = new Date(Date.now() - 60000);
  private processedEmails: Set<string> = new Set();

  constructor(private adapter: GoogleServiceAdapter) {}

  async check(config: EmailWithAttachmentConfig): Promise<EmailWithAttachmentOutput[]> {
    try {
      let query = 'has:attachment';

      const dateStr = this.formatGmailDate(this.lastCheckTimestamp);
      query += ` after:${dateStr}`;

      if (config.from) {
        if (config.from.startsWith('@')) {
          query += ` from:${config.from}`;
        } else {
          query += ` from:${config.from}`;
        }
      }

      console.log(`[EmailWithAttachment] Checking with query: ${query}`);

      const response = await this.adapter.listEmails({
        maxResults: 50,
        query
      });

      if (!response.messages || response.messages.length === 0) {
        console.log('[EmailWithAttachment] No new emails with attachments found');
        this.lastCheckTimestamp = new Date();
        return [];
      }

      console.log(`[EmailWithAttachment] Found ${response.messages.length} emails with attachments`);

      const results: EmailWithAttachmentOutput[] = [];

      for (const message of response.messages) {
        if (this.processedEmails.has(message.id)) {
          continue;
        }

        try {
          const email = await this.getEmailWithAttachments(message.id, config);

          if (!email) continue;

          this.processedEmails.add(message.id);
          results.push(email);

        } catch (error: any) {
          console.error(`[EmailWithAttachment] Error processing email ${message.id}:`, error.message);
        }
      }

      this.lastCheckTimestamp = new Date();

      if (results.length > 0) {
        console.log(`[EmailWithAttachment] Triggering ${results.length} actions`);
      }

      return results;

    } catch (error: any) {
      console.error('[EmailWithAttachment] Error checking emails:', error.message);
      throw error;
    }
  }

  private async getEmailWithAttachments(
    messageId: string,
    config: EmailWithAttachmentConfig
  ): Promise<EmailWithAttachmentOutput | null> {
    const response = await (this.adapter as any).gmail.users.messages.get({
      userId: 'me',
      id: messageId
    });

    const message = response.data;
    const headers = message.payload?.headers || [];

    const getHeader = (name: string) =>
      headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    const attachments = this.extractAttachments(message.payload);

    if (attachments.length === 0) {
      return null;
    }

    const filteredAttachments = attachments.filter(att => this.matchesFilters(att, config));

    if (filteredAttachments.length === 0) {
      return null;
    }

    if (config.downloadAttachments) {
      for (const attachment of filteredAttachments) {
        try {
          const attResponse = await (this.adapter as any).gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: messageId,
            id: attachment.attachmentId
          });

          attachment.content = attResponse.data.data;
        } catch (error: any) {
          console.error(`[EmailWithAttachment] Error downloading attachment:`, error.message);
        }
      }
    }

    const totalSize = filteredAttachments.reduce((sum, att) => sum + att.size, 0);

    return {
      emailId: message.id!,
      threadId: message.threadId!,
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: getHeader('To'),
      date: getHeader('Date'),
      snippet: message.snippet || '',
      attachments: filteredAttachments,
      totalAttachmentSize: totalSize,
      attachmentCount: filteredAttachments.length
    };
  }

  private extractAttachments(payload: any): Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }> {
    const attachments: Array<any> = [];

    const processPart = (part: any) => {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size || 0,
          attachmentId: part.body.attachmentId
        });
      }

      if (part.parts) {
        part.parts.forEach(processPart);
      }
    };

    if (payload?.parts) {
      payload.parts.forEach(processPart);
    }

    return attachments;
  }

  private matchesFilters(
    attachment: { filename: string; mimeType: string; size: number },
    config: EmailWithAttachmentConfig
  ): boolean {
    if (config.fileTypes && config.fileTypes.length > 0) {
      const extension = attachment.filename.split('.').pop()?.toLowerCase();
      if (!extension || !config.fileTypes.includes(extension)) {
        return false;
      }
    }

    if (config.minFileSize !== undefined && attachment.size < config.minFileSize) {
      return false;
    }

    if (config.maxFileSize !== undefined && attachment.size > config.maxFileSize) {
      return false;
    }

    if (config.filenamePattern) {
      try {
        const regex = new RegExp(config.filenamePattern);
        if (!regex.test(attachment.filename)) {
          return false;
        }
      } catch (error) {
        console.error('[EmailWithAttachment] Invalid regex pattern:', config.filenamePattern);
      }
    }

    return true;
  }

  private formatGmailDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  validateConfig(config: any): config is EmailWithAttachmentConfig {
    if (config.fileTypes !== undefined && !Array.isArray(config.fileTypes)) {
      throw new Error('fileTypes must be an array');
    }

    if (config.minFileSize !== undefined && typeof config.minFileSize !== 'number') {
      throw new Error('minFileSize must be a number');
    }

    if (config.maxFileSize !== undefined && typeof config.maxFileSize !== 'number') {
      throw new Error('maxFileSize must be a number');
    }

    if (config.filenamePattern !== undefined) {
      try {
        new RegExp(config.filenamePattern);
      } catch (error) {
        throw new Error('filenamePattern must be a valid regex pattern');
      }
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
      id: 'google_email_with_attachment',
      name: 'Email with Attachment Received',
      description: 'Triggers when an email with attachments is received, with advanced filtering',
      service: 'google',
      category: 'gmail',
      configSchema: emailWithAttachmentSchema,
      outputExample: {
        emailId: '18c1f2a3b4d5e6f7',
        threadId: '18c1f2a3b4d5e6f7',
        subject: 'Invoice #12345',
        from: 'accounting@vendor.com',
        to: 'me@example.com',
        date: 'Mon, 15 Jan 2024 10:30:00 +0000',
        snippet: 'Please find attached invoice...',
        attachments: [
          {
            filename: 'invoice-12345.pdf',
            mimeType: 'application/pdf',
            size: 245760,
            attachmentId: 'ANGjdJ8...',
            content: 'base64_content_here...'
          }
        ],
        totalAttachmentSize: 245760,
        attachmentCount: 1
      },
      requiredScopes: ['https:
    };
  }
}
