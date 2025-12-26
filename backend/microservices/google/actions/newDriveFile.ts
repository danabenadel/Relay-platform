
import { GoogleServiceAdapter } from '../google-adapter';

export interface NewDriveFileConfig {
  folderId?: string;
  fileTypes?: string[];
  namePattern?: string;
  minSize?: number;
  maxSize?: number;
  excludeFolders?: boolean;
  checkInterval?: number;
}

export interface NewDriveFileOutput {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  thumbnailLink?: string;
  owners: Array<{ displayName: string; emailAddress: string }>;
  isFolder: boolean;
}

export const newDriveFileSchema = {
  type: 'object',
  properties: {
    folderId: {
      type: 'string',
      description: 'Specific Google Drive folder ID to monitor',
      examples: ['1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms']
    },
    fileTypes: {
      type: 'array',
      description: 'Filter by MIME types',
      items: { type: 'string' },
      examples: [
        ['application/pdf'],
        ['image/jpeg', 'image/png'],
        ['application/vnd.google-apps.spreadsheet']
      ]
    },
    namePattern: {
      type: 'string',
      description: 'Regex pattern for filename',
      examples: ['^report-.*', '.*invoice.*\\.pdf$']
    },
    minSize: {
      type: 'number',
      description: 'Minimum file size in bytes',
      minimum: 0
    },
    maxSize: {
      type: 'number',
      description: 'Maximum file size in bytes',
      minimum: 0
    },
    excludeFolders: {
      type: 'boolean',
      description: 'Exclude folders from monitoring',
      default: true
    },
    checkInterval: {
      type: 'number',
      description: 'Check interval in seconds',
      minimum: 60,
      maximum: 3600,
      default: 300
    }
  },
  additionalProperties: false
};

export class NewDriveFileAction {
  private lastCheckTimestamp: Date = new Date(Date.now() - 300000);
  private processedFiles: Set<string> = new Set();

  constructor(private adapter: GoogleServiceAdapter) {}

  async check(config: NewDriveFileConfig): Promise<NewDriveFileOutput[]> {
    try {
      const query = this.buildQuery(config);

      const response = await this.adapter.listFiles({
        pageSize: 50,
        query,
        orderBy: 'createdTime desc'
      });

      if (!response.files || response.files.length === 0) {
        this.lastCheckTimestamp = new Date();
        return [];
      }

      const results: NewDriveFileOutput[] = [];

      for (const file of response.files) {
        if (this.processedFiles.has(file.id)) {
          continue;
        }

        const createdTime = new Date(file.createdTime);
        if (createdTime <= this.lastCheckTimestamp) {
          continue;
        }

        if (!this.matchesFilters(file, config)) {
          continue;
        }

        const fullFile = await this.getFileDetails(file.id);

        if (fullFile) {
          this.processedFiles.add(file.id);
          results.push(fullFile);
        }
      }

      this.lastCheckTimestamp = new Date();

      if (results.length > 0) {
        console.log(`[NewDriveFile] Triggering ${results.length} actions`);
      }

      return results;

    } catch (error: any) {
      console.error('[NewDriveFile] Error checking files:', error.message);
      throw error;
    }
  }

  private buildQuery(config: NewDriveFileConfig): string {
    const queries: string[] = [];

    if (config.folderId) {
      queries.push(`'${config.folderId}' in parents`);
    }

    if (config.fileTypes && config.fileTypes.length > 0) {
      const typeQueries = config.fileTypes.map(type => `mimeType='${type}'`);
      queries.push(`(${typeQueries.join(' or ')})`);
    }

    if (config.excludeFolders !== false) {
      queries.push(`mimeType!='application/vnd.google-apps.folder'`);
    }

    queries.push('trashed=false');

    return queries.join(' and ');
  }

  private matchesFilters(file: any, config: NewDriveFileConfig): boolean {
    if (config.namePattern) {
      try {
        const regex = new RegExp(config.namePattern);
        if (!regex.test(file.name)) {
          return false;
        }
      } catch (error) {
        console.error('[NewDriveFile] Invalid regex:', config.namePattern);
      }
    }

    const size = parseInt(file.size || '0');

    if (config.minSize !== undefined && size < config.minSize) {
      return false;
    }

    if (config.maxSize !== undefined && size > config.maxSize) {
      return false;
    }

    return true;
  }

  private async getFileDetails(fileId: string): Promise<NewDriveFileOutput | null> {
    try {
      const response = await (this.adapter as any).drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,owners'
      });

      const file = response.data;

      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: parseInt(file.size || '0'),
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
        thumbnailLink: file.thumbnailLink,
        owners: file.owners || [],
        isFolder: file.mimeType === 'application/vnd.google-apps.folder'
      };
    } catch (error: any) {
      console.error(`[NewDriveFile] Error getting file details:`, error.message);
      return null;
    }
  }

  validateConfig(config: any): config is NewDriveFileConfig {
    if (config.fileTypes !== undefined && !Array.isArray(config.fileTypes)) {
      throw new Error('fileTypes must be an array');
    }

    if (config.namePattern !== undefined) {
      try {
        new RegExp(config.namePattern);
      } catch (error) {
        throw new Error('namePattern must be a valid regex');
      }
    }

    return true;
  }

  cleanupCache(): void {
    if (this.processedFiles.size > 1000) {
      const entries = Array.from(this.processedFiles);
      this.processedFiles = new Set(entries.slice(-1000));
    }
  }

  static getMetadata() {
    return {
      id: 'google_new_drive_file',
      name: 'New Drive File Created',
      description: 'Triggers when a new file is created in Google Drive',
      service: 'google',
      category: 'drive',
      configSchema: newDriveFileSchema,
      outputExample: {
        id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        name: 'Q4 Report.pdf',
        mimeType: 'application/pdf',
        size: 2457600,
        createdTime: '2024-01-15T10:30:00.000Z',
        modifiedTime: '2024-01-15T10:30:00.000Z',
        webViewLink: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
        thumbnailLink: 'https://drive.google.com/thumbnail?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        owners: [
          {
            displayName: 'John Doe',
            emailAddress: 'john@example.com'
          }
        ],
        isFolder: false
      },
      requiredScopes: ['https://www.googleapis.com/auth/drive.readonly']
    };
  }
}
