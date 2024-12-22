import React, { useState, useRef } from 'react';
import { EmailContact } from '../../types';
import { parseCSV } from '../../utils/csvParser';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  onSave: (name: string, contacts: EmailContact[]) => void;
  onCancel: () => void;
}

export const ContactListForm: React.FC<Props> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    if (!csvContent.trim()) {
      toast.error('Please enter contact data or upload a CSV file');
      return;
    }

    try {
      const contacts = parseCSV(csvContent);
      onSave(name, contacts);
      toast.success('Contact list created successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          List Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="My Contact List"
        />
      </div>

      <div className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contacts (CSV format: name;email)
          </label>
          <textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="John Doe;john@example.com"
          />
        </div>
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
          Save List
        </button>
      </div>
    </form>
  );
};