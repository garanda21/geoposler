import { EmailContact } from '../types';

export const parseCSV = (content: string): EmailContact[] => {
  try {
    const existingEmails = new Set<string>();
    return content
      .split('\n')
      .filter(line => line.trim())
      .reduce<EmailContact[]>((acc, line) => {
        const [name, email] = line.split(';').map(field => field.trim());
        
        if (!name || !email) {
          throw new Error('Invalid CSV format: Each line must contain a name and email separated by semicolon');
        }

        if (!email.includes('@')) {
          throw new Error(`Invalid email format: ${email}`);
        }

        if (existingEmails.has(email)) {
          return acc; // Skip duplicate emails
        }

        existingEmails.add(email);
        acc.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name,
          email
        });
        
        return acc;
      }, []);
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
};