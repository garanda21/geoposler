import React from 'react';
import { ContactList } from '../../types';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  contactLists: ContactList[];
  selectedListId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

export const ContactListSelector: React.FC<Props> = ({
  contactLists,
  selectedListId,
  onSelect,
  onCreateNew,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('contacts.list.title')}</h3>
        <button
          onClick={onCreateNew}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <PlusCircle className="w-5 h-5 mr-1" />
          {t('contacts.list.newList')}
        </button>
      </div>
      <div className="space-y-2">
        {contactLists.map((list) => (
          <button
            key={list.id}
            onClick={() => onSelect(list.id)}
            className={`w-full text-left px-4 py-2 rounded-md ${
              selectedListId === list.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="font-medium">{list.name}</div>
            <div className="text-sm text-gray-500">
              ({list.contacts.length} {t('campaigns.newCampaign.contactCount')})
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};