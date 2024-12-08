import nodemailer from 'nodemailer';
import { SmtpConfig } from '../types';

export const createTransporter = (config: SmtpConfig) => {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });
};

export const verifySmtpConnection = async (config: SmtpConfig): Promise<boolean> => {
  try {
    const transporter = createTransporter(config);
    await transporter.verify();
    return true;
  } catch (error) {
    return false;
  }
};