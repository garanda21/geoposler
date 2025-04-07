import React, { useState, useRef } from 'react';
import { EmailContact } from '../../types';
import { parseCSV } from '../../utils/csvParser';
import { Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Props {
  onSave: (name: string, contacts: EmailContact[]) => void;
  onCancel: () => void;
}

export const ContactListForm: React.FC<Props> = ({ onSave, onCancel }) => {
  const { t } = useTranslation();
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
        toast.success(t('contacts.uploader.messages.success'));
      } catch (error) {
        toast.error(t('contacts.uploader.messages.error'));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('contacts.list.messages.nameRequired'));
      return;
    }

    if (!csvContent.trim()) {
      toast.error(t('contacts.list.messages.dataRequired'));
      return;
    }

    try {
      const contacts = parseCSV(csvContent);
      onSave(name, contacts);
      toast.success(t('contacts.list.messages.listCreated'));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleExportCSV = () => {
    if (!csvContent.trim()) {
      toast.error(t('contacts.list.messages.dataRequired'));
      return;
    }

    try {
      // Crear un blob con el contenido CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Crear un objeto URL para el blob
      const url = URL.createObjectURL(blob);
      
      // Crear un enlace temporal para la descarga
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name || 'contacts'}.csv`);
      document.body.appendChild(link);
      
      // Simular clic en el enlace para iniciar la descarga
      link.click();
      
      // Limpiar después de la descarga
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(t('contacts.list.messages.exportSuccess') || 'Lista de contactos exportada con éxito');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('contacts.list.form.listName')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={t('contacts.list.form.listNamePlaceholder')}
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
            <span>{t('contacts.uploader.button')}</span>
          </button>
          <p className="text-sm text-gray-500 text-center mt-2">
            {t('contacts.uploader.format')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">            
            {t('contacts.addContact.csvFormat')}
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
          {t('contacts.list.actions.cancel')}
        </button>
        {csvContent && (
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 border flex items-center space-x-1 rounded-md text-indigo-600 hover:bg-indigo-50"
          >
            <Download className="w-4 h-4" />
            <span>{t('contacts.list.actions.exportCSV') || 'Exportar CSV'}</span>
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {t('contacts.list.form.saveList')}
        </button>
      </div>
    </form>
  );
};