
import { google, gmail_v1, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';

interface GoogleAdapterOptions {
  accessToken: string;
  refreshToken?: string;
  onTokenRefresh?: (newToken: string, expiresAt: Date) => Promise<void>;
}

// Helper function to decode RFC 2047 encoded-word format (used in email headers)
function decodeHeaderValue(value: string): string {
  if (!value) return value;

  // RFC 2047 format: =?charset?encoding?encoded-text?=
  const encodedWordRegex = /=\?([^?]+)\?([QB])\?([^?]*)\?=/gi;

  return value.replace(encodedWordRegex, (match, charset, encoding, encodedText) => {
    try {
      if (encoding.toUpperCase() === 'B') {
        // Base64 encoding
        const buffer = Buffer.from(encodedText, 'base64');
        return buffer.toString('utf-8');
      } else if (encoding.toUpperCase() === 'Q') {
        // Quoted-printable encoding
        const decoded = encodedText
          .replace(/_/g, ' ')
          .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        return decoded;
      }
    } catch (error) {
      console.error(`[Gmail] Failed to decode header value: ${match}`, error);
    }
    return match;
  });
}

// Helper function to encode header value in RFC 2047 format (for sending emails with special characters)
function encodeHeaderValue(value: string): string {
  if (!value) return value;

  // Check if the value contains non-ASCII characters
  if (!/[^\x00-\x7F]/.test(value)) {
    // Only ASCII characters, no encoding needed
    return value;
  }

  // Encode using UTF-8 and Base64 (=?UTF-8?B?...?=)
  const encoded = Buffer.from(value, 'utf-8').toString('base64');
  return `=?UTF-8?B?${encoded}?=`;
}

export class GoogleServiceAdapter {
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail;
  private drive: drive_v3.Drive;
  private onTokenRefresh?: (newToken: string, expiresAt: Date) => Promise<void>;

  constructor(options: GoogleAdapterOptions) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: options.accessToken,
      refresh_token: options.refreshToken
    });

    this.onTokenRefresh = options.onTokenRefresh;
    this.oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token && this.onTokenRefresh) {
        const expiresAt = tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : new Date(Date.now() + 3600000);

        await this.onTokenRefresh(tokens.access_token, expiresAt);
      }
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  public setAccessToken(token: string): void {
    this.oauth2Client.setCredentials({
      access_token: token,
      refresh_token: this.oauth2Client.credentials.refresh_token
    });
  }

  async sendEmail(params: {
    to: string | string[];
    subject: string;
    body: string;
    html?: boolean;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{ filename: string; content: string; encoding?: string }>;
    threadId?: string;
    headers?: Record<string, string>;
  }): Promise<{ id: string; threadId: string }> {
    try {
      const to = Array.isArray(params.to) ? params.to.join(', ') : params.to;
      const cc = params.cc ? (Array.isArray(params.cc) ? params.cc.join(', ') : params.cc) : '';
      const bcc = params.bcc ? (Array.isArray(params.bcc) ? params.bcc.join(', ') : params.bcc) : '';

      const emailLines = [
        `To: ${to}`,
        cc ? `Cc: ${cc}` : '',
        bcc ? `Bcc: ${bcc}` : '',
        `Subject: ${encodeHeaderValue(params.subject)}`,
        'Content-Type: text/' + (params.html ? 'html' : 'plain') + '; charset=utf-8'
      ];

      // Add custom headers (for replies: In-Reply-To, References)
      if (params.headers) {
        for (const [key, value] of Object.entries(params.headers)) {
          emailLines.push(`${key}: ${value}`);
        }
      }

      // Build email with proper structure: headers, blank line, body
      const email = emailLines.filter(Boolean).join('\n') + '\n\n' + params.body;

      const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const requestBody: any = {
        raw: encodedEmail
      };

      // Add threadId for replies
      if (params.threadId) {
        requestBody.threadId = params.threadId;
      }

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody
      });

      console.log(`[Gmail] Email sent: ${response.data.id}`);

      return {
        id: response.data.id!,
        threadId: response.data.threadId!
      };
    } catch (error: any) {
      console.error('[Gmail] Send email error:', error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async listEmails(params?: {
    maxResults?: number;
    query?: string;
    labelIds?: string[];
    pageToken?: string;
  }): Promise<{
    messages: Array<{ id: string; threadId: string }>;
    nextPageToken?: string;
    resultSizeEstimate: number;
  }> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: params?.maxResults || 10,
        q: params?.query,
        labelIds: params?.labelIds,
        pageToken: params?.pageToken
      });

      return {
        messages: (response.data.messages || []).map(msg => ({
          id: msg.id || '',
          threadId: msg.threadId || ''
        })),
        nextPageToken: response.data.nextPageToken || undefined,
        resultSizeEstimate: response.data.resultSizeEstimate || 0
      };
    } catch (error: any) {
      console.error('[Gmail] List emails error:', error.message);
      throw new Error(`Failed to list emails: ${error.message}`);
    }
  }

  async getEmail(messageId: string): Promise<{
    id: string;
    threadId: string;
    subject: string;
    from: string;
    to: string;
    date: string;
    snippet: string;
    body: string;
    labelIds: string[];
  }> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload?.headers || [];

      const getHeader = (name: string) =>
        headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      let body = '';
      if (message.payload?.body?.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      } else if (message.payload?.parts) {
        const textPart = message.payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      return {
        id: message.id!,
        threadId: message.threadId!,
        subject: decodeHeaderValue(getHeader('Subject')),
        from: decodeHeaderValue(getHeader('From')),
        to: decodeHeaderValue(getHeader('To')),
        date: getHeader('Date'),
        snippet: message.snippet || '',
        body,
        labelIds: message.labelIds || []
      };
    } catch (error: any) {
      console.error('[Gmail] Get email error:', error.message);
      throw new Error(`Failed to get email: ${error.message}`);
    }
  }

  async getLabels(): Promise<Array<{ id: string; name: string; type: string }>> {
    try {
      const response = await this.gmail.users.labels.list({
        userId: 'me'
      });

      return (response.data.labels || []).map(label => ({
        id: label.id!,
        name: label.name!,
        type: label.type!
      }));
    } catch (error: any) {
      console.error('[Gmail] Get labels error:', error.message);
      throw new Error(`Failed to get labels: ${error.message}`);
    }
  }

  async addLabel(messageId: string, labelIds: string[]): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: labelIds
        }
      });

      console.log(`[Gmail] Labels added to message ${messageId}`);
    } catch (error: any) {
      console.error('[Gmail] Add label error:', error.message);
      throw new Error(`Failed to add label: ${error.message}`);
    }
  }

  async markAsRead(messageId: string, read = true): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: read
          ? { removeLabelIds: ['UNREAD'] }
          : { addLabelIds: ['UNREAD'] }
      });

      console.log(`[Gmail] Message ${messageId} marked as ${read ? 'read' : 'unread'}`);
    } catch (error: any) {
      console.error('[Gmail] Mark as read error:', error.message);
      throw new Error(`Failed to mark as read: ${error.message}`);
    }
  }

  async listFiles(params?: {
    pageSize?: number;
    query?: string;
    orderBy?: string;
    pageToken?: string;
  }): Promise<{
    files: Array<{
      id: string;
      name: string;
      mimeType: string;
      size?: string;
      createdTime: string;
      modifiedTime: string;
      webViewLink?: string;
    }>;
    nextPageToken?: string;
  }> {
    try {
      const response = await this.drive.files.list({
        pageSize: params?.pageSize || 10,
        q: params?.query,
        orderBy: params?.orderBy || 'modifiedTime desc',
        pageToken: params?.pageToken,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)'
      });

      return {
        files: (response.data.files || []).map(file => ({
          id: file.id!,
          name: file.name!,
          mimeType: file.mimeType!,
          size: file.size || undefined,
          createdTime: file.createdTime!,
          modifiedTime: file.modifiedTime!,
          webViewLink: file.webViewLink || undefined
        })),
        nextPageToken: response.data.nextPageToken || undefined
      };
    } catch (error: any) {
      console.error('[Drive] List files error:', error.message);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async uploadFile(params: {
    name: string;
    content: Buffer | string;
    mimeType: string;
    folderId?: string;
  }): Promise<{
    id: string;
    name: string;
    webViewLink?: string;
  }> {
    try {
      const fileMetadata: any = {
        name: params.name
      };

      if (params.folderId) {
        fileMetadata.parents = [params.folderId];
      }

      // Gmail API returns attachments in base64-urlsafe format
      // Need to convert - to + and _ to / before decoding
      const buffer = typeof params.content === 'string'
        ? Buffer.from(params.content.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
        : params.content;

      const stream = Readable.from(buffer);

      const media = {
        mimeType: params.mimeType,
        body: stream
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink'
      });

      console.log(`[Drive] File uploaded: ${response.data.id}`);

      return {
        id: response.data.id!,
        name: response.data.name!,
        webViewLink: response.data.webViewLink || undefined
      };
    } catch (error: any) {
      console.error('[Drive] Upload file error:', error.message);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error: any) {
      console.error('[Drive] Download file error:', error.message);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async shareFile(params: {
    fileId: string;
    type: 'anyone' | 'user' | 'group' | 'domain';
    role: 'reader' | 'writer' | 'commenter';
    emailAddress?: string;
  }): Promise<{ permissionId: string }> {
    try {
      const response = await this.drive.permissions.create({
        fileId: params.fileId,
        requestBody: {
          type: params.type,
          role: params.role,
          emailAddress: params.emailAddress
        }
      });

      console.log(`[Drive] File ${params.fileId} shared with ${params.type}`);

      return {
        permissionId: response.data.id!
      };
    } catch (error: any) {
      console.error('[Drive] Share file error:', error.message);
      throw new Error(`Failed to share file: ${error.message}`);
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({ fileId });
      console.log(`[Drive] File ${fileId} deleted`);
    } catch (error: any) {
      console.error('[Drive] Delete file error:', error.message);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async createFolder(name: string, parentFolderId?: string): Promise<{
    id: string;
    name: string;
    webViewLink?: string;
  }> {
    try {
      const fileMetadata: any = {
        name,
        mimeType: 'application/vnd.google-apps.folder'
      };

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, webViewLink'
      });

      console.log(`[Drive] Folder created: ${response.data.id}`);

      return {
        id: response.data.id!,
        name: response.data.name!,
        webViewLink: response.data.webViewLink || undefined
      };
    } catch (error: any) {
      console.error('[Drive] Create folder error:', error.message);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }
}
