export interface Template {
  id: string;
  name: string;
  content: string;
}

export interface EmailContact {
  id: string;
  name: string;
  email: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  templateName: string;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  sentCount: number;
  totalCount: number;
  error?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailError {
  email: string;
  error: string;
}

export interface SendEmailResponse {
  success: boolean;
  error?: string;
}