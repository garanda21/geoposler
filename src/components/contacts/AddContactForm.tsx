import React, { useState, useRef } from 'react';
import { EmailContact } from '../../types';
import { parseCSV } from '../../utils/csvParser';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  onAdd: (contacts: EmailContact[]) => void;
  onCancel: () => void;
}

export const AddContactForm: React.FC<Props> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (csvContent) {
      try {
        const contacts = parseCSV(csvContent);
        onAdd(contacts);
        setCsvContent('');
        toast.success('Contacts imported successfully');
      } catch (error: any) {
        toast.error(error.message);
      }
      return;
    }

    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const newContact: EmailContact = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.trim(),
    };

    onAdd([newContact]);
    setName('');
    setEmail('');
    //toast.success('Contact added successfully');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setCsvContent(content);
        toast.success('CSV file loaded successfully');
      } catch (error) {
        toast.error('Error reading CSV file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="john@example.com"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-2 text-sm text-gray-500">Or import multiple contacts</span>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-indigo-600"
          >
            <Upload className="w-5 h-5" />
            <span>Upload CSV File</span>
          </button>
          <p className="text-sm text-gray-500 text-center mt-2">
            Format: name;email (one per line)
          </p>
        </div>

        {csvContent && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preview CSV Content
            </label>
            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="John Doe;john@example.com"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {csvContent ? 'Import Contacts' : 'Add Contact'}
        </button>
      </div>
    </form>
  );
};