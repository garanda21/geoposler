import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EmailContact } from '../types';
import toast from 'react-hot-toast';

export const ContactsUploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importContacts } = useStore();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const contacts: EmailContact[] = text
          .split('\n')
          .filter(Boolean)
          .map((line) => {
            const [name, email] = line.split(';').map((s) => s.trim());
            return { 
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name, 
              email 
            };
          });
        importContacts(contacts);
        toast.success(`${contacts.length} contacts imported successfully`);
      } catch (error) {
        toast.error('Error importing contacts. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center w-full p-4 text-gray-600 hover:text-indigo-600"
      >
        <Upload className="mr-2" />
        Upload Contact List (CSV)
      </button>
      <p className="text-sm text-gray-500 mt-2">
        Format: name;email@example.com (one per line)
      </p>
    </div>
  );
};