
import { GoogleServiceAdapter } from '../google-adapter';

export interface ReplyToEmailConfig {
  emailId: string;
  body: string;
  replyAll?: boolean;
  html?: boolean;
  includeOriginal?: boolean;
  useTemplates?: boolean;
}

export interface ReplyToEmailInput {
  emailId?: string;
  threadId?: string;
  [key: string]: any;
}

export interface ReplyToEmailOutput {
  success: boolean;
  emailId: string;
  threadId: string;
  inReplyTo: string;
  recipients: string[];
  timestamp: string;
}

export const replyToEmailSchema = {
  type: 'object',
  required: ['body'],
  properties: {
    emailId: {
      type: 'string',
      description: 'ID of the email to reply to (can use {{action.id}} from trigger)',
      examples: ['{{action.id}}', '18c1f2a3b4d5e6f7']
    },
    body: {
      type: 'string',
      description: 'Reply body (supports {{variable}} templates)',
      minLength: 1,
      examples: [
        'Thank you for your email.',
        'Re: {{action.subject}} - I will look into this.',
        'Hello {{action.from}}, thanks for reaching out about {{action.subject}}.'
      ]
    },
    replyAll: {
      type: 'boolean',
      description: 'Reply to all recipients instead of just the sender',
      default: false
    },
    html: {
      type: 'boolean',
      description: 'Use HTML formatting for reply body',
      default: false
    },
    includeOriginal: {
      type: 'boolean',
      description: 'Include original message in reply',
      default: true
    },
    useTemplates: {
      type: 'boolean',
      description: 'Enable {{variable}} template replacement',
      default: true
    }
  },
  additionalProperties: false
};

export class ReplyToEmailReaction {
  constructor(private adapter: GoogleServiceAdapter) {}

  async execute(config: ReplyToEmailConfig, input: ReplyToEmailInput): Promise<ReplyToEmailOutput> {
    try {
      const processedConfig = config.useTemplates !== false
        ? this.processTemplates(config, input)
        : config;

      const emailId = processedConfig.emailId || input.emailId;
      if (!emailId) {
        throw new Error('emailId is required (provide in config or from trigger)');
      }

      console.log(`[ReplyToEmail] Replying to email: ${emailId}`);

      const originalEmail = await this.adapter.getEmail(emailId);

      console.log(`[ReplyToEmail] Original from: ${originalEmail.from}`);
      console.log(`[ReplyToEmail] Original subject: ${originalEmail.subject}`);
      console.log(`[ReplyToEmail] Reply all: ${processedConfig.replyAll}`);
      console.log(`[ReplyToEmail] Config body: ${processedConfig.body}`);

      const recipients = this.buildRecipients(originalEmail, processedConfig.replyAll || false);

      let replyBody = processedConfig.body;
      console.log(`[ReplyToEmail] Reply body before format: ${replyBody}`);

      if (processedConfig.includeOriginal !== false) {
        replyBody = this.formatReplyWithOriginal(replyBody, originalEmail, processedConfig.html || false);
      }

      console.log(`[ReplyToEmail] Reply body after format: ${replyBody}`);
      console.log(`[ReplyToEmail] Reply subject: ${this.buildReplySubject(originalEmail.subject)}`);

      const headers: Record<string, string> = {
        'In-Reply-To': originalEmail.id,
        'References': originalEmail.id
      };

      const result = await this.adapter.sendEmail({
        to: recipients.to,
        cc: recipients.cc,
        subject: this.buildReplySubject(originalEmail.subject),
        body: replyBody,
        html: processedConfig.html || false,
        threadId: originalEmail.threadId,
        headers
      });

      console.log(`[ReplyToEmail] Reply sent successfully: ${result.id}`);

      return {
        success: true,
        emailId: result.id,
        threadId: result.threadId,
        inReplyTo: emailId,
        recipients: [recipients.to, ...(recipients.cc || [])].filter(Boolean),
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('[ReplyToEmail] Error sending reply:', error.message);
      throw new Error(`Failed to reply to email: ${error.message}`);
    }
  }

  private buildRecipients(
    originalEmail: any,
    replyAll: boolean
  ): { to: string; cc?: string[] } {
    const fromMatch = originalEmail.from.match(/<(.+?)>/);
    const senderEmail = fromMatch ? fromMatch[1] : originalEmail.from;

    if (!replyAll) {
      return { to: senderEmail };
    }

    const ccRecipients: string[] = [];

    if (originalEmail.to) {
      const toEmails = this.extractEmails(originalEmail.to);
      ccRecipients.push(...toEmails);
    }

    if (originalEmail.cc) {
      const ccEmails = this.extractEmails(originalEmail.cc);
      ccRecipients.push(...ccEmails);
    }

    const uniqueCC = Array.from(new Set(ccRecipients)).filter(email => email !== senderEmail);

    return {
      to: senderEmail,
      cc: uniqueCC.length > 0 ? uniqueCC : undefined
    };
  }

  private extractEmails(emailString: string): string[] {
    const emails: string[] = [];
    const matches = emailString.match(/<(.+?)>/g);

    if (matches) {
      matches.forEach(match => {
        const email = match.replace(/[<>]/g, '');
        if (email) emails.push(email);
      });
    } else {
      const simpleEmails = emailString.split(',').map(e => e.trim()).filter(e => e.includes('@'));
      emails.push(...simpleEmails);
    }

    return emails;
  }

  private buildReplySubject(originalSubject: string): string {
    if (originalSubject.toLowerCase().startsWith('re:')) {
      return originalSubject;
    }
    return `Re: ${originalSubject}`;
  }

  private formatReplyWithOriginal(
    replyBody: string,
    originalEmail: any,
    isHtml: boolean
  ): string {
    if (isHtml) {
      return `
        <div>${replyBody}</div>
        <br>
        <div style="border-left: 2px solid #ccc; padding-left: 10px; margin-top: 20px;">
          <p><strong>On ${originalEmail.date}, ${originalEmail.from} wrote:</strong></p>
          <div>${originalEmail.body}</div>
        </div>
      `;
    } else {
      return `${replyBody}

---
On ${originalEmail.date}, ${originalEmail.from} wrote:

${originalEmail.body.split('\n').map(line => `> ${line}`).join('\n')}`;
    }
  }

  private processTemplates(config: ReplyToEmailConfig, input: ReplyToEmailInput): ReplyToEmailConfig {
    const processString = (str: string): string => {
      return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const value = this.getNestedValue(input, path.trim());
        return value !== undefined ? String(value) : match;
      });
    };

    return {
      ...config,
      emailId: config.emailId ? processString(config.emailId) : config.emailId,
      body: processString(config.body)
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  validateConfig(config: any, input?: ReplyToEmailInput): config is ReplyToEmailConfig {
    if (!config.emailId && !input?.emailId) {
      throw new Error('emailId is required (provide in config or will be taken from trigger)');
    }

    if (!config.body || typeof config.body !== 'string') {
      throw new Error('body is required and must be a string');
    }

    return true;
  }

  static getMetadata() {
    return {
      id: 'google_reply_to_email',
      name: 'Reply to Email',
      description: 'Replies to an email in Gmail, maintaining thread context',
      service: 'google',
      category: 'gmail',
      configSchema: replyToEmailSchema,
      inputExample: {
        action: {
          id: '18c1f2a3b4d5e6f7',
          threadId: '18c1f2a3b4d5e6f7',
          subject: 'Important Update',
          from: 'boss@company.com',
          to: 'me@example.com',
          date: 'Mon, 15 Jan 2024 10:30:00 +0000',
          body: 'Can you review this report?'
        }
      },
      outputExample: {
        success: true,
        emailId: '18c1f2a3b4d5e6f8',
        threadId: '18c1f2a3b4d5e6f7',
        inReplyTo: '18c1f2a3b4d5e6f7',
        recipients: ['boss@company.com'],
        timestamp: '2024-01-15T10:35:00.000Z'
      },
      templateVariables: [
        '{{action.id}} - Email ID to reply to',
        '{{action.subject}} - Original email subject',
        '{{action.from}} - Sender of original email',
        '{{action.body}} - Original email body',
        '{{action.snippet}} - Original email snippet',
        '{{action.date}} - Original email date',
        '{{user.email}} - Current user email'
      ],
      requiredScopes: ['https:
    };
  }
}
