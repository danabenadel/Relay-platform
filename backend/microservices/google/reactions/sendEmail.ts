
import { GoogleServiceAdapter } from '../google-adapter';

export interface SendEmailConfig {
  to: string | string[];
  subject: string;
  body: string;
  cc?: string | string[];
  bcc?: string | string[];
  html?: boolean;
  useTemplates?: boolean;
}

export interface SendEmailInput {
  [key: string]: any;
}

export interface SendEmailOutput {
  success: boolean;
  emailId: string;
  threadId: string;
  recipients: string[];
  subject: string;
  timestamp: string;
}

export const sendEmailSchema = {
  type: 'object',
  required: ['to', 'subject', 'body'],
  properties: {
    to: {
      oneOf: [
        { type: 'string', format: 'email' },
        {
          type: 'array',
          items: { type: 'string', format: 'email' },
          minItems: 1
        }
      ],
      description: 'Recipient email address(es)',
      examples: ['user@example.com', ['user1@example.com', 'user2@example.com']]
    },
    subject: {
      type: 'string',
      description: 'Email subject (supports {{variable}} templates)',
      minLength: 1,
      maxLength: 998,
      examples: [
        'New notification from AREA',
        'Alert: {{action.subject}}',
        'You received an email from {{action.from}}'
      ]
    },
    body: {
      type: 'string',
      description: 'Email body (supports {{variable}} templates)',
      minLength: 1,
      examples: [
        'You have a new notification.',
        'Email received: {{action.snippet}}',
        'File uploaded: {{action.name}} ({{action.size}} bytes)'
      ]
    },
    cc: {
      oneOf: [
        { type: 'string', format: 'email' },
        { type: 'array', items: { type: 'string', format: 'email' } }
      ],
      description: 'CC recipients (optional)'
    },
    bcc: {
      oneOf: [
        { type: 'string', format: 'email' },
        { type: 'array', items: { type: 'string', format: 'email' } }
      ],
      description: 'BCC recipients (optional)'
    },
    html: {
      type: 'boolean',
      description: 'Use HTML formatting for email body',
      default: false
    },
    useTemplates: {
      type: 'boolean',
      description: 'Enable {{variable}} template replacement',
      default: true
    }
  },
  additionalProperties: false
};

export class SendEmailReaction {
  constructor(private adapter: GoogleServiceAdapter) {}

  async execute(config: SendEmailConfig, input: SendEmailInput): Promise<SendEmailOutput> {
    try {
      const processedConfig = config.useTemplates !== false
        ? this.processTemplates(config, input)
        : config;

      console.log(`[SendEmail] Sending email to: ${processedConfig.to}`);
      console.log(`[SendEmail] Subject: ${processedConfig.subject}`);

      const result = await this.adapter.sendEmail({
        to: processedConfig.to,
        subject: processedConfig.subject,
        body: processedConfig.body,
        cc: processedConfig.cc,
        bcc: processedConfig.bcc,
        html: processedConfig.html || false
      });

      console.log(`[SendEmail] Email sent successfully: ${result.id}`);

      return {
        success: true,
        emailId: result.id,
        threadId: result.threadId,
        recipients: Array.isArray(processedConfig.to) ? processedConfig.to : [processedConfig.to],
        subject: processedConfig.subject,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('[SendEmail] Error sending email:', error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  private processTemplates(config: SendEmailConfig, input: SendEmailInput): SendEmailConfig {
    const processString = (str: string): string => {
      return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const value = this.getNestedValue(input, path.trim());
        return value !== undefined ? String(value) : match;
      });
    };

    return {
      ...config,
      subject: processString(config.subject),
      body: processString(config.body)
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  validateConfig(config: any): config is SendEmailConfig {
    if (!config.to) {
      throw new Error('to is required');
    }

    if (typeof config.to === 'string' && !this.isValidEmail(config.to)) {
      throw new Error('to must be a valid email address');
    }

    if (Array.isArray(config.to)) {
      if (config.to.length === 0) {
        throw new Error('to must have at least one recipient');
      }
      config.to.forEach((email: string) => {
        if (!this.isValidEmail(email)) {
          throw new Error(`Invalid email address: ${email}`);
        }
      });
    }

    if (!config.subject || typeof config.subject !== 'string') {
      throw new Error('subject is required and must be a string');
    }

    if (!config.body || typeof config.body !== 'string') {
      throw new Error('body is required and must be a string');
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static getMetadata() {
    return {
      id: 'google_send_email',
      name: 'Send Email',
      description: 'Sends an email via Gmail with template support',
      service: 'google',
      category: 'gmail',
      configSchema: sendEmailSchema,
      inputExample: {
        action: {
          subject: 'Important Update',
          from: 'boss@company.com',
          snippet: 'Meeting at 3pm...'
        }
      },
      outputExample: {
        success: true,
        emailId: '18c1f2a3b4d5e6f7',
        threadId: '18c1f2a3b4d5e6f7',
        recipients: ['user@example.com'],
        subject: 'Alert: Important Update',
        timestamp: '2024-01-15T10:30:00.000Z'
      },
      templateVariables: [
        '{{action.subject}} - Email subject from trigger',
        '{{action.from}} - Sender email from trigger',
        '{{action.body}} - Email body from trigger',
        '{{action.snippet}} - Email snippet from trigger',
        '{{action.date}} - Email date from trigger',
        '{{trigger.name}} - Trigger name',
        '{{user.email}} - Current user email'
      ],
      requiredScopes: ['https:
    };
  }
}
