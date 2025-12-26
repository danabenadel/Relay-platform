export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface AuditLogData {
  userId: string;
  action: string;
  ipAddress: string;
  userAgent?: string;
  metadata?: any;
}

export type OAuth2Provider = 'google' | 'facebook' | 'github' | 'twitter';
