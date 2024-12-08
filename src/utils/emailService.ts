import axios from 'axios';
import { SmtpConfig, EmailContact, SendEmailResponse } from '../types';

const API_URL = 'http://localhost:3000/api';

const validateSmtpConfig = (config: SmtpConfig): string | null => {
  if (!config.host) return 'SMTP host is required';
  if (!config.port) return 'SMTP port is required';
  if (!config.username) return 'SMTP username is required';
  if (!config.password) return 'SMTP password is required';
  if (!config.fromEmail) return 'From email is required';
  if (!config.fromName) return 'From name is required';
  return null;
};

export const verifySmtpConnection = async (config: SmtpConfig): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_URL}/verify-smtp`, config);
    return response.data.success;
  } catch (error) {
    return false;
  }
};

export const sendEmail = async (
  contact: EmailContact,
  subject: string,
  content: string,
  smtpConfig: SmtpConfig
): Promise<SendEmailResponse> => {
  const configError = validateSmtpConfig(smtpConfig);
  if (configError) {
    return { success: false, error: configError };
  }

  try {
    const response = await axios.post(`${API_URL}/send-email`, {
      contact,
      subject,
      content,
      smtpConfig,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to send email'
    };
  }
};