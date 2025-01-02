import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ContactListSelector } from '../contacts/ContactListSelector';
import { ContactListForm } from '../contacts/ContactListForm';
import { ContactListDetails } from '../contacts/ContactListDetails';
import { EmailContact } from '../../types';
import toast from 'react-hot-toast';

export const ContactsTab: React.FC = () => {
  const { contactLists, addContactList, updateContactList, deleteContactList } = useStore();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateList = (name: string, contacts: EmailContact[]) => {
    const newList = {
      id: Date.now().toString(),
      name,
      contacts,
    };
    addContactList(newList);
    setSelectedListId(newList.id);
    setIsCreating(false);
    //toast.success('Contact list created successfully');
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
      toast.success('Contact list deleted successfully');
    }
  };

  const selectedList = contactLists.find((list) => list.id === selectedListId);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Contact Lists</h2>
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <ContactListSelector
            contactLists={contactLists}
            selectedListId={selectedListId}
            onSelect={setSelectedListId}
            onCreateNew={() => setIsCreating(true)}
          />
        </div>
        <div className="col-span-3">
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
              Select a contact list or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
};