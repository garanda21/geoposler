import React, { useState } from 'react';
import { TemplateEditor } from '../TemplateEditor';
import { TemplateList } from '../editor/TemplateList';
import { useStore } from '../../store/useStore';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export const TemplatesTab: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { templates, addTemplate } = useStore();

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
      toast.success('Template uploaded successfully');
    };
    reader.readAsText(file);
  };

  const handleCreateTemplate = () => {
    const id = Date.now().toString();
    const newTemplate = {
      id,
      name: 'New Template',
      content: '<h1>Hello {{name}}!</h1>',
    };
    addTemplate(newTemplate);
    setSelectedTemplateId(id);
    toast.success('New template created');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer">
            <Upload className="w-5 h-5 inline-block mr-2" />
            Upload Template
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
            New Template
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
              Select a template or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
};