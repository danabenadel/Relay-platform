
import { GoogleServiceAdapter } from '../google-adapter';

export interface SaveAttachmentToDriveConfig {
  emailId?: string;
  folderId?: string;
  fileTypes?: string[];
  minFileSize?: number;
  maxFileSize?: number;
  filenamePattern?: string;
  renamePattern?: string;
  overwrite?: boolean;
  useTemplates?: boolean;
}

export interface SaveAttachmentToDriveInput {
  emailId?: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
    content?: string;
  }>;
  [key: string]: any;
}

export interface SaveAttachmentToDriveOutput {
  success: boolean;
  savedFiles: Array<{
    originalName: string;
    savedName: string;
    fileId: string;
    webViewLink: string;
    size: number;
    mimeType: string;
  }>;
  totalSaved: number;
  totalSize: number;
  folderId: string;
  timestamp: string;
}

export const saveAttachmentToDriveSchema = {
  type: 'object',
  properties: {
    emailId: {
      type: 'string',
      description: 'ID of the email with attachments (use {{action.emailId}} from trigger)',
      examples: ['{{action.emailId}}', '18c1f2a3b4d5e6f7']
    },
    folderId: {
      type: 'string',
      description: 'Target Google Drive folder ID (default: root)',
      examples: ['1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms']
    },
    fileTypes: {
      type: 'array',
      description: 'Filter attachments by file extensions',
      items: {
        type: 'string',
        pattern: '^[a-zA-Z0-9]+$'
      },
      examples: [['pdf', 'docx'], ['jpg', 'png'], ['zip', 'rar', '7z']]
    },
    minFileSize: {
      type: 'number',
      description: 'Minimum file size in bytes',
      minimum: 0,
      examples: [1024, 10240]
    },
    maxFileSize: {
      type: 'number',
      description: 'Maximum file size in bytes (25MB Gmail limit)',
      minimum: 0,
      maximum: 26214400,
      examples: [10485760, 26214400]
    },
    filenamePattern: {
      type: 'string',
      description: 'Regex pattern to match attachment filenames',
      examples: ['^invoice-.*\\.pdf$', '.*report.*']
    },
    renamePattern: {
      type: 'string',
      description: 'Rename pattern (supports {{filename}}, {{date}}, {{from}}, etc.)',
      examples: [
        '{{date}}_{{filename}}',
        'invoice_{{action.from}}_{{filename}}',
        '{{action.subject}}_attachment_{{index}}'
      ]
    },
    overwrite: {
      type: 'boolean',
      description: 'Overwrite existing files with same name',
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

export class SaveAttachmentToDriveReaction {
  constructor(private adapter: GoogleServiceAdapter) {}

  async execute(
    config: SaveAttachmentToDriveConfig,
    input: SaveAttachmentToDriveInput
  ): Promise<SaveAttachmentToDriveOutput> {
    try {
      const processedConfig = config.useTemplates !== false
        ? this.processTemplates(config, input)
        : config;

      const emailId = processedConfig.emailId || input.emailId;
      if (!emailId) {
        throw new Error('emailId is required (provide in config or from trigger)');
      }

      console.log(`[SaveAttachmentToDrive] Processing email: ${emailId}`);

      let attachments = input.attachments;
      if (!attachments || attachments.length === 0) {
        console.log('[SaveAttachmentToDrive] Fetching attachments from Gmail...');
        attachments = await this.fetchAttachments(emailId);
      }

      if (!attachments || attachments.length === 0) {
        console.log('[SaveAttachmentToDrive] No attachments found');
        return {
          success: true,
          savedFiles: [],
          totalSaved: 0,
          totalSize: 0,
          folderId: processedConfig.folderId || 'root',
          timestamp: new Date().toISOString()
        };
      }

      console.log(`[SaveAttachmentToDrive] Found ${attachments.length} attachments`);

      const filteredAttachments = attachments.filter(att =>
        this.matchesFilters(att, processedConfig)
      );

      if (filteredAttachments.length === 0) {
        console.log('[SaveAttachmentToDrive] No attachments match filters');
        return {
          success: true,
          savedFiles: [],
          totalSaved: 0,
          totalSize: 0,
          folderId: processedConfig.folderId || 'root',
          timestamp: new Date().toISOString()
        };
      }

      console.log(`[SaveAttachmentToDrive] ${filteredAttachments.length} attachments match filters`);

      const savedFiles: any[] = [];
      let totalSize = 0;

      for (let index = 0; index < filteredAttachments.length; index++) {
        const attachment = filteredAttachments[index];

        try {
          let content = attachment.content;
          if (!content) {
            console.log(`[SaveAttachmentToDrive] Downloading attachment: ${attachment.filename}`);
            content = await this.downloadAttachment(emailId, attachment.attachmentId);
          }

          const filename = processedConfig.renamePattern
            ? this.applyRenamePattern(processedConfig.renamePattern, attachment, input, index)
            : attachment.filename;

          if (!processedConfig.overwrite) {
            const exists = await this.fileExists(filename, processedConfig.folderId);
            if (exists) {
              console.log(`[SaveAttachmentToDrive] Skipping existing file: ${filename}`);
              continue;
            }
          }

          console.log(`[SaveAttachmentToDrive] Uploading to Drive: ${filename}`);
          const driveFile = await this.adapter.uploadFile({
            name: filename,
            mimeType: attachment.mimeType,
            content: content,
            folderId: processedConfig.folderId
          });

          savedFiles.push({
            originalName: attachment.filename,
            savedName: filename,
            fileId: driveFile.id,
            webViewLink: driveFile.webViewLink,
            size: attachment.size,
            mimeType: attachment.mimeType
          });

          totalSize += attachment.size;

          console.log(`[SaveAttachmentToDrive] Uploaded successfully: ${driveFile.id}`);

        } catch (error: any) {
          console.error(`[SaveAttachmentToDrive] Error saving ${attachment.filename}:`, error.message);
        }
      }

      console.log(`[SaveAttachmentToDrive] Saved ${savedFiles.length} files to Drive`);

      return {
        success: true,
        savedFiles,
        totalSaved: savedFiles.length,
        totalSize,
        folderId: processedConfig.folderId || 'root',
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('[SaveAttachmentToDrive] Error:', error.message);
      throw new Error(`Failed to save attachments to Drive: ${error.message}`);
    }
  }

  private async fetchAttachments(emailId: string): Promise<any[]> {
    const response = await (this.adapter as any).gmail.users.messages.get({
      userId: 'me',
      id: emailId
    });

    const message = response.data;
    const attachments: any[] = [];

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

    if (message.payload?.parts) {
      message.payload.parts.forEach(processPart);
    }

    return attachments;
  }

  private async downloadAttachment(emailId: string, attachmentId: string): Promise<string> {
    const response = await (this.adapter as any).gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: emailId,
      id: attachmentId
    });

    return response.data.data;
  }

  private matchesFilters(
    attachment: { filename: string; mimeType: string; size: number },
    config: SaveAttachmentToDriveConfig
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
        console.error('[SaveAttachmentToDrive] Invalid regex:', config.filenamePattern);
      }
    }

    return true;
  }

  private applyRenamePattern(
    pattern: string,
    attachment: any,
    input: any,
    index: number
  ): string {
    let result = pattern;

    result = result.replace(/\{\{filename\}\}/g, attachment.filename);
    result = result.replace(/\{\{name\}\}/g, attachment.filename.replace(/\.[^.]+$/, ''));
    result = result.replace(/\{\{ext\}\}/g, attachment.filename.split('.').pop() || '');
    result = result.replace(/\{\{index\}\}/g, String(index + 1));
    result = result.replace(/\{\{date\}\}/g, new Date().toISOString().split('T')[0]);
    result = result.replace(/\{\{timestamp\}\}/g, Date.now().toString());

    result = result.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(input, path.trim());
      return value !== undefined ? String(value) : match;
    });

    return result;
  }

  private async fileExists(filename: string, folderId?: string): Promise<boolean> {
    try {
      const query = folderId
        ? `name='${filename}' and '${folderId}' in parents and trashed=false`
        : `name='${filename}' and trashed=false`;

      const response = await this.adapter.listFiles({
        pageSize: 1,
        query
      });

      return response.files && response.files.length > 0;
    } catch (error) {
      return false;
    }
  }

  private processTemplates(
    config: SaveAttachmentToDriveConfig,
    input: SaveAttachmentToDriveInput
  ): SaveAttachmentToDriveConfig {
    const processString = (str: string): string => {
      return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const value = this.getNestedValue(input, path.trim());
        return value !== undefined ? String(value) : match;
      });
    };

    return {
      ...config,
      emailId: config.emailId ? processString(config.emailId) : config.emailId,
      folderId: config.folderId ? processString(config.folderId) : config.folderId,
      renamePattern: config.renamePattern ? processString(config.renamePattern) : config.renamePattern
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  validateConfig(config: any, input?: SaveAttachmentToDriveInput): config is SaveAttachmentToDriveConfig {
    if (!config.emailId && !input?.emailId && !input?.attachments) {
      throw new Error('emailId is required (provide in config or from trigger)');
    }

    if (config.fileTypes !== undefined && !Array.isArray(config.fileTypes)) {
      throw new Error('fileTypes must be an array');
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

  static getMetadata() {
    return {
      id: 'google_save_attachment_to_drive',
      name: 'Save Attachment to Drive',
      description: 'Saves email attachments to Google Drive with advanced filtering and renaming',
      service: 'google',
      category: 'drive',
      configSchema: saveAttachmentToDriveSchema,
      inputExample: {
        action: {
          emailId: '18c1f2a3b4d5e6f7',
          subject: 'Invoice #12345',
          from: 'accounting@vendor.com',
          attachments: [
            {
              filename: 'invoice-12345.pdf',
              mimeType: 'application/pdf',
              size: 245760,
              attachmentId: 'ANGjdJ8...',
              content: 'base64_content_here...'
            }
          ]
        }
      },
      outputExample: {
        success: true,
        savedFiles: [
          {
            originalName: 'invoice-12345.pdf',
            savedName: '2024-01-15_invoice-12345.pdf',
            fileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            webViewLink: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
            size: 245760,
            mimeType: 'application/pdf'
          }
        ],
        totalSaved: 1,
        totalSize: 245760,
        folderId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
        timestamp: '2024-01-15T10:35:00.000Z'
      },
      templateVariables: [
        '{{action.emailId}} - Email ID from trigger',
        '{{action.subject}} - Email subject',
        '{{action.from}} - Email sender',
        '{{filename}} - Original attachment filename',
        '{{name}} - Filename without extension',
        '{{ext}} - File extension',
        '{{index}} - Attachment index (1-based)',
        '{{date}} - Current date (YYYY-MM-DD)',
        '{{timestamp}} - Unix timestamp'
      ],
      requiredScopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/drive.file'
      ]
    };
  }
}
