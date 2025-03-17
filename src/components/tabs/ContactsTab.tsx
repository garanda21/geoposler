import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ContactListSelector } from '../contacts/ContactListSelector';
import { ContactListForm } from '../contacts/ContactListForm';
import { ContactListDetails } from '../contacts/ContactListDetails';
import { EmailContact } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const ContactsTab: React.FC = () => {
  const { contactLists, addContactList, updateContactList, deleteContactList } = useStore();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { t } = useTranslation();

  const handleCreateList = (name: string, contacts: EmailContact[]) => {
    const newList = {
      id: Date.now().toString(),
      name,
      contacts,
    };
    addContactList(newList);
    setSelectedListId(newList.id);
    setIsCreating(false);
  };

  const handleUpdateContacts = (contacts: EmailContact[]) => {
    if (selectedListId) {
      updateContactList(selectedListId, { contacts });
    }
  };

  const handleDeleteList = () => {
    if (selectedListId) {
      deleteContactList(selectedListId);
      setSelectedListId(null);
      toast.success(t('contacts.list.messages.deleteSuccess'));
    }
  };

  const selectedList = contactLists.find((list) => list.id === selectedListId);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t('contacts.list.title')}</h2>
      <div className="flex gap-6">
        {/* Left side with scrollable contact lists */}
        <div className="w-1/4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <ContactListSelector
            contactLists={contactLists}
            selectedListId={selectedListId}
            onSelect={setSelectedListId}
            onCreateNew={() => setIsCreating(true)}
          />
        </div>
        
        {/* Right side with fixed position content */}
        <div className="w-3/4 sticky top-0">
          {isCreating ? (
            <ContactListForm
              onSave={handleCreateList}
              onCancel={() => setIsCreating(false)}
            />
          ) : selectedList ? (
            <ContactListDetails
              contactList={selectedList}
              onUpdate={handleUpdateContacts}
              onDelete={handleDeleteList}
            />
          ) : (
            <div className="text-center text-gray-500 mt-8">
              {t('contacts.list.messages.selectContactList')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};