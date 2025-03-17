import React, { useState } from 'react';
import { TemplateEditor } from '../TemplateEditor';
import { TemplateList } from '../editor/TemplateList';
import { useStore } from '../../store/useStore';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const TemplatesTab: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { addTemplate } = useStore();
  const { t } = useTranslation();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const id = Date.now().toString();
      const newTemplate = {
        id,
        name: file.name.replace('.html', ''),
        content,
      };
      addTemplate(newTemplate);
      setSelectedTemplateId(id);
      toast.success(t('templates.messages.uploadSuccess'));
    };
    reader.readAsText(file);
  };

  const handleCreateTemplate = () => {
    const id = Date.now().toString();
    const newTemplate = {
      id,
      name: 'New Template',
      content: '',
    };
    addTemplate(newTemplate);
    setSelectedTemplateId(id);
    toast.success(t('templates.messages.createSuccess'));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('templates.emailTemplates')}</h2>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer">
            <Upload className="w-5 h-5 inline-block mr-2" />
            {t('templates.uploadTemplate')}
            <input
              type="file"
              accept=".html"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={handleCreateTemplate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {t('templates.newTemplate')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <TemplateList
            selectedId={selectedTemplateId}
            onSelect={setSelectedTemplateId}
          />
        </div>
        <div className="col-span-3">
          {selectedTemplateId ? (
            <TemplateEditor templateId={selectedTemplateId} />
          ) : (
            <div className="text-center text-gray-500 mt-8">
              {t('templates.selectOrCreate')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};