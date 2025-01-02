import axios from 'axios';
import { EmailContact, SmtpConfig, SendEmailResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const verifySmtpConnection = async (config: SmtpConfig): Promise<SendEmailResponse> => {
  try {
    const response = await api.post('/verify-smtp', config);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

export const sendEmail = async (
  contact: EmailContact,
  subject: string,
  content: string,
  smtpConfig: SmtpConfig
): Promise<SendEmailResponse> => {
  try {
    const response = await api.post('/send-email', {
      contact,
      subject,
      content,
      smtpConfig
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};