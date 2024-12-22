import React from 'react';
import { useStore } from '../../store/useStore';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const TemplateList: React.FC<Props> = ({ selectedId, onSelect }) => {
  const { templates, deleteTemplate } = useStore();

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    if (selectedId === id) {
      onSelect(templates[0]?.id || '');
    }
    toast.success('Template deleted successfully');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-200">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
              selectedId === template.id ? 'bg-indigo-50' : ''
            }`}
            onClick={() => onSelect(template.id)}
          >
            <span className="font-medium">{template.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(template.id);
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};