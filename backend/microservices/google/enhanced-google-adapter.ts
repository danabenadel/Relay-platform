import { google, gmail_v1, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { googleQuotaManager } from './quota-manager';
import { circuitBreakerManager } from '../facebook/circuit-breaker';

interface EnhancedGoogleAdapterOptions {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  onTokenRefresh?: (newToken: string, expiresAt: Date) => Promise<void>;
  enableQuotaManagement?: boolean;
  enableCircuitBreaker?: boolean;
  enableMetrics?: boolean;
}

interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  quotaExceededCount: number;
  avgLatency: number;
  totalLatency: number;
  lastRequest?: Date;
}

/**
 * Enhanced Google Service Adapter
 */
export class EnhancedGoogleServiceAdapter {
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail;
  private drive: drive_v3.Drive;
  private userId: string;
  private onTokenRefresh?: (newToken: string, expiresAt: Date) => Promise<void>;
  private enableQuotaManagement: boolean;
  private enableCircuitBreaker: boolean;
  private enableMetrics: boolean;
  private metrics: RequestMetrics;

  constructor(options: EnhancedGoogleAdapterOptions) {
    this.userId = options.userId;
    this.onTokenRefresh = options.onTokenRefresh;
    this.enableQuotaManagement = options.enableQuotaManagement ?? true;
    this.enableCircuitBreaker = options.enableCircuitBreaker ?? true;
    this.enableMetrics = options.enableMetrics ?? true;

    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      quotaExceededCount: 0,
      avgLatency: 0,
      totalLatency: 0
    };

    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials
    this.oauth2Client.setCredentials({
      access_token: options.accessToken,
      refresh_token: options.refreshToken
    });

    // Handle automatic token refresh
    this.oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token && this.onTokenRefresh) {
        const expiresAt = tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : new Date(Date.now() + 3600000);

        console.log(`[Google:${this.userId}] Token auto-refreshed, expires at ${expiresAt.toISOString()}`);
        await this.onTokenRefresh(tokens.access_token, expiresAt);
      }
    });

    // Initialize API clients
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Execute request with all enhancements
   */
  private async executeRequest<T>(
    service: 'gmail' | 'drive',
    operation: string,
    fn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    const startTime = Date.now();

    // Update metrics
    if (this.enableMetrics) {
      this.metrics.totalRequests++;
      this.metrics.lastRequest = new Date();
    }

    // Check quota
    if (this.enableQuotaManagement) {
      const quotaCheck = googleQuotaManager.canPerform(this.userId, service, operation);

      if (!quotaCheck.allowed) {
        if (this.enableMetrics) {
          this.metrics.quotaExceededCount++;
        }

        console.warn(
          `[Google:${this.userId}] ${quotaCheck.reason}. Wait ${quotaCheck.waitSeconds}s`
        );

        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, (quotaCheck.waitSeconds || 1) * 1000));
        return this.executeRequest(service, operation, fn, retryCount);
      }
    }

    // Execute with circuit breaker
    const execute = async () => {
      try {
        const result = await fn();

        // Record quota usage
        if (this.enableQuotaManagement) {
          googleQuotaManager.recordUsage(this.userId, service, operation);
        }

        // Update metrics
        if (this.enableMetrics) {
          this.metrics.successfulRequests++;
          const latency = Date.now() - startTime;
          this.metrics.totalLatency += latency;
          this.metrics.avgLatency = this.metrics.totalLatency / this.metrics.successfulRequests;
        }

        return result;
      } catch (error: any) {
        if (this.enableMetrics) {
          this.metrics.failedRequests++;
        }

        return this.handleError(error, service, operation, fn, retryCount);
      }
    };

    // Execute with or without circuit breaker
    if (this.enableCircuitBreaker) {
      const breaker = circuitBreakerManager.getBreaker(`google-${service}-${this.userId}`);
      return breaker.execute(execute);
    } else {
      return execute();
    }
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleError<T>(
    error: any,
    service: 'gmail' | 'drive',
    operation: string,
    fn: () => Promise<T>,
    retryCount: number
  ): Promise<T> {
    const errorCode = error.code;
    const errorMessage = error.message || '';

    // Quota exceeded (429)
    if (errorCode === 429 || errorMessage.includes('quotaExceeded')) {
      console.warn(`[Google:${this.userId}] Quota exceeded for ${service}.${operation}`);

      if (this.enableMetrics) {
        this.metrics.quotaExceededCount++;
      }

      // Exponential backoff
      const backoff = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoff));

      if (retryCount < 3) {
        return this.executeRequest(service, operation, fn, retryCount + 1);
      }

      throw new Error(`Quota exceeded for ${service}.${operation} after ${retryCount} retries`);
    }

    // Unauthorized (401) - token expired
    if (errorCode === 401) {
      console.error(`[Google:${this.userId}] Token expired or invalid`);
      throw new Error('Token expired - please re-authenticate');
    }

    // Forbidden (403) - insufficient permissions
    if (errorCode === 403) {
      console.error(`[Google:${this.userId}] Insufficient permissions for ${service}.${operation}`);
      throw new Error(`Insufficient permissions for ${service}.${operation}`);
    }

    // Not Found (404)
    if (errorCode === 404) {
      throw new Error(`Resource not found in ${service}`);
    }

    // Rate limit error (specific to Google APIs)
    if (errorMessage.includes('rate limit') || errorMessage.includes('userRateLimitExceeded')) {
      console.warn(`[Google:${this.userId}] Rate limit hit for ${service}.${operation}`);

      const backoff = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoff));

      if (retryCount < 3) {
        return this.executeRequest(service, operation, fn, retryCount + 1);
      }
    }

    // Server errors (500+) - retry with backoff
    if (errorCode >= 500 && retryCount < 3) {
      const backoff = Math.pow(2, retryCount) * 1000;
      console.warn(`[Google:${this.userId}] Server error, retrying in ${backoff}ms...`);

      await new Promise(resolve => setTimeout(resolve, backoff));
      return this.executeRequest(service, operation, fn, retryCount + 1);
    }

    // Unknown error
    console.error(`[Google:${this.userId}] API error:`, {
      service,
      operation,
      code: errorCode,
      message: errorMessage
    });

    throw error;
  }

  // ==================== GMAIL METHODS ====================

  /**
   * Send an email
   * Quota cost: 100 units
   */
  async sendEmail(params: {
    to: string | string[];
    subject: string;
    body: string;
    html?: boolean;
    cc?: string | string[];
    bcc?: string | string[];
  }): Promise<{ id: string; threadId: string }> {
    return this.executeRequest('gmail', 'send', async () => {
      const to = Array.isArray(params.to) ? params.to.join(', ') : params.to;
      const cc = params.cc ? (Array.isArray(params.cc) ? params.cc.join(', ') : params.cc) : '';
      const bcc = params.bcc ? (Array.isArray(params.bcc) ? params.bcc.join(', ') : params.bcc) : '';

      const email = [
        `To: ${to}`,
        cc ? `Cc: ${cc}` : '',
        bcc ? `Bcc: ${bcc}` : '',
        `Subject: ${params.subject}`,
        'Content-Type: text/' + (params.html ? 'html' : 'plain') + '; charset=utf-8',
        '',
        params.body
      ].filter(Boolean).join('\n');

      const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedEmail }
      });

      console.log(`[Gmail:${this.userId}] Email sent: ${response.data.id}`);

      return {
        id: response.data.id!,
        threadId: response.data.threadId!
      };
    });
  }

  /**
   * List emails
   * Quota cost: 5 units
   */
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
    return this.executeRequest('gmail', 'list', async () => {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: params?.maxResults || 10,
        q: params?.query,
        labelIds: params?.labelIds,
        pageToken: params?.pageToken
      });

      return {
        messages: response.data.messages || [],
        nextPageToken: response.data.nextPageToken || undefined,
        resultSizeEstimate: response.data.resultSizeEstimate || 0
      };
    });
  }

  /**
   * Get email details
   * Quota cost: 5 units
   */
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
    return this.executeRequest('gmail', 'get', async () => {
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
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        date: getHeader('Date'),
        snippet: message.snippet || '',
        body,
        labelIds: message.labelIds || []
      };
    });
  }

  /**
   * Batch get multiple emails
   * More efficient than multiple get calls
   */
  async batchGetEmails(messageIds: string[]): Promise<Array<any>> {
    const results: any[] = [];

    // Gmail batch API allows up to 100 requests
    const batchSize = 100;

    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize);

      const batchPromises = batch.map(id => this.getEmail(id).catch(err => ({
        error: true,
        id,
        message: err.message
      })));

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get labels
   * Quota cost: 1 unit
   */
  async getLabels(): Promise<Array<{ id: string; name: string; type: string }>> {
    return this.executeRequest('gmail', 'labels', async () => {
      const response = await this.gmail.users.labels.list({ userId: 'me' });

      return (response.data.labels || []).map(label => ({
        id: label.id!,
        name: label.name!,
        type: label.type!
      }));
    });
  }

  /**
   * Modify labels
   * Quota cost: 5 units
   */
  async modifyLabels(messageId: string, params: {
    addLabelIds?: string[];
    removeLabelIds?: string[];
  }): Promise<void> {
    return this.executeRequest('gmail', 'modify', async () => {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: params.addLabelIds,
          removeLabelIds: params.removeLabelIds
        }
      });

      console.log(`[Gmail:${this.userId}] Labels modified for message ${messageId}`);
    });
  }

  /**
   * Mark as read/unread
   * Quota cost: 5 units
   */
  async markAsRead(messageId: string, read = true): Promise<void> {
    return this.modifyLabels(messageId, read
      ? { removeLabelIds: ['UNREAD'] }
      : { addLabelIds: ['UNREAD'] }
    );
  }

  // ==================== GOOGLE DRIVE METHODS ====================

  /**
   * List files
   * Quota cost: 1 unit
   */
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
    return this.executeRequest('drive', 'list', async () => {
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
          size: file.size,
          createdTime: file.createdTime!,
          modifiedTime: file.modifiedTime!,
          webViewLink: file.webViewLink
        })),
        nextPageToken: response.data.nextPageToken || undefined
      };
    });
  }

  /**
   * Upload file
   * Quota cost: 1 unit
   */
  async uploadFile(params: {
    name: string;
    content: Buffer | string;
    mimeType: string;
    folderId?: string;
  }): Promise<{ id: string; name: string; webViewLink?: string }> {
    return this.executeRequest('drive', 'create', async () => {
      const fileMetadata: any = { name: params.name };

      if (params.folderId) {
        fileMetadata.parents = [params.folderId];
      }

      const media = {
        mimeType: params.mimeType,
        body: typeof params.content === 'string'
          ? Buffer.from(params.content)
          : params.content
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media as any,
        fields: 'id, name, webViewLink'
      });

      console.log(`[Drive:${this.userId}] File uploaded: ${response.data.id}`);

      return {
        id: response.data.id!,
        name: response.data.name!,
        webViewLink: response.data.webViewLink
      };
    });
  }

  /**
   * Download file
   * Quota cost: 1 unit
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    return this.executeRequest('drive', 'get', async () => {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      return Buffer.from(response.data as ArrayBuffer);
    });
  }

  /**
   * Delete file
   * Quota cost: 1 unit
   */
  async deleteFile(fileId: string): Promise<void> {
    return this.executeRequest('drive', 'delete', async () => {
      await this.drive.files.delete({ fileId });
      console.log(`[Drive:${this.userId}] File ${fileId} deleted`);
    });
  }

  /**
   * Create folder
   * Quota cost: 1 unit
   */
  async createFolder(name: string, parentFolderId?: string): Promise<{
    id: string;
    name: string;
    webViewLink?: string;
  }> {
    return this.executeRequest('drive', 'create', async () => {
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

      console.log(`[Drive:${this.userId}] Folder created: ${response.data.id}`);

      return {
        id: response.data.id!,
        name: response.data.name!,
        webViewLink: response.data.webViewLink
      };
    });
  }

  // ==================== MONITORING & HEALTH ====================

  /**
   * Get adapter metrics
   */
  getMetrics(): RequestMetrics {
    return { ...this.metrics };
  }

  /**
   * Get quota status
   */
  getQuotaStatus() {
    if (!this.enableQuotaManagement) return null;
    return googleQuotaManager.getQuotaStatus(this.userId);
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    if (!this.enableCircuitBreaker) return null;

    const gmailBreaker = circuitBreakerManager.getBreaker(`google-gmail-${this.userId}`);
    const driveBreaker = circuitBreakerManager.getBreaker(`google-drive-${this.userId}`);

    return {
      gmail: gmailBreaker.getStatus(),
      drive: driveBreaker.getStatus()
    };
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    isHealthy: boolean;
    metrics: RequestMetrics;
    quotaStatus: any;
    circuitStatus: any;
  } {
    const circuitStatus = this.getCircuitBreakerStatus();
    const isHealthy = !circuitStatus ||
      (circuitStatus.gmail.state !== 'OPEN' && circuitStatus.drive.state !== 'OPEN');

    return {
      isHealthy,
      metrics: this.getMetrics(),
      quotaStatus: this.getQuotaStatus(),
      circuitStatus
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      quotaExceededCount: 0,
      avgLatency: 0,
      totalLatency: 0
    };
  }
}
