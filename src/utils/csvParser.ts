import { EmailContact } from '../types';

export const parseCSV = (content: string): EmailContact[] => {
  try {
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [name, email] = line.split(';').map(field => field.trim());
        
        if (!name || !email) {
          throw new Error('Invalid CSV format: Each line must contain a name and email separated by semicolon');
        }

        if (!email.includes('@')) {
          throw new Error(`Invalid email format: ${email}`);
        }

        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name,
          email
        };
      });
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
};