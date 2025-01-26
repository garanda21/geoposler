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

export interface ContactList {
  id: string;
  name: string;
  contacts: EmailContact[];
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  templateName: string;
  contactListId: string;
  contactListName: string;
  status: 'draft' | 'sending' | 'completed' | 'failed' | 'completed with errors';
  sentCount: number;
  totalCount: number;
  createDate?: string;
  error?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  useSSL: boolean;
  useAuth: boolean;
}

export interface SendEmailResponse {
  success: boolean;
  error?: string;
}