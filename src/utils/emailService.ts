import axios from 'axios';
import { EmailContact, SmtpConfig, SendEmailResponse } from '../types';

const API_URL = 'http://10.70.29.123:3000';

export const verifySmtpConnection = async (config: SmtpConfig): Promise<SendEmailResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/verify-smtp`, config);
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
    const response = await axios.post(`${API_URL}/api/send-email`, {
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