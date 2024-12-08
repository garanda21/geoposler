import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../store/useStore';
import { RichTextEditor } from './editor/RichTextEditor';
import { Code, Eye } from 'lucide-react';

interface Props {
  templateId: string;
}

export const TemplateEditor: React.FC<Props> = ({ templateId }) => {
  const { templates, updateTemplate } = useStore();
  const template = templates.find((t) => t.id === templateId);
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [name, setName] = useState(template?.name || '');

  if (!template) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            updateTemplate(templateId, { name: e.target.value });
          }}
          className="flex-1 px-4 py-2 border rounded-md"
          placeholder="Template Name"
        />
        <div className="flex bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setMode('visual')}
            className={`px-3 py-1 rounded ${
              mode === 'visual' ? 'bg-white shadow' : ''
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode('code')}
            className={`px-3 py-1 rounded ${
              mode === 'code' ? 'bg-white shadow' : ''
            }`}
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      {mode === 'visual' ? (
        <RichTextEditor
          content={template.content}
          onChange={(content) => updateTemplate(templateId, { content })}
        />
      ) : (
        <Editor
          height="600px"
          defaultLanguage="html"
          value={template.content}
          onChange={(value) => updateTemplate(templateId, { content: value || '' })}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
          }}
        />
      )}

      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: template.content }}
        />
      </div>
    </div>
  );
};