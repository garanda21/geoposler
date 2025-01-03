import React, { useState } from 'react';
import { ContactList, EmailContact } from '../../types';
import { Pencil, Trash2, Save, X, UserPlus } from 'lucide-react';
import { AddContactForm } from './AddContactForm';
import toast from 'react-hot-toast';

interface Props {
  contactList: ContactList;
  onUpdate: (contacts: EmailContact[]) => void;
  onDelete: () => void;
}

export const ContactListDetails: React.FC<Props> = ({
  contactList,
  onUpdate,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EmailContact>({ id: '', name: '', email: '' });
  const [isAddingContact, setIsAddingContact] = useState(false);

  const handleEdit = (contact: EmailContact) => {
    setEditingId(contact.id);
    setEditForm(contact);
  };

  const handleSave = () => {
    if (!editForm.name || !editForm.email) {
      toast.error('Name and email are required');
      return;
    }

    if (!editForm.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const updatedContacts = contactList.contacts.map((c) =>
      c.id === editForm.id ? editForm : c
    );
    onUpdate(updatedContacts);
    setEditingId(null);
    toast.success('Contact updated successfully');
  };

  const handleDelete = (id: string) => {
    const updatedContacts = contactList.contacts.filter((c) => c.id !== id);
    onUpdate(updatedContacts);
    toast.success('Contact deleted successfully');
  };

  const handleAddContacts = (newContacts: EmailContact[]) => {
    if (newContacts.length === 1 && contactList.contacts.some(existing => 
      existing.email.toLowerCase() === newContacts[0].email.toLowerCase()
    )) {
      toast.error('Email address already exists', {duration: 5000});
      return;
    }
    else
    {
      // Remove duplicates and contacts that already exist in contactList
      const uniqueNewContacts = newContacts.filter(
        newContact => !contactList.contacts.some(
          existing => existing.email.toLowerCase() === newContact.email.toLowerCase()
        ) && newContacts.findIndex(
          c => c.email.toLowerCase() === newContact.email.toLowerCase()
        ) === newContacts.indexOf(newContact)
      );
      if (uniqueNewContacts.length !== newContacts.length) {
        toast('Duplicate or existing email addresses were removed', {
          icon: '⚠️',
          duration: 5000,
        });
      }
      newContacts = uniqueNewContacts;
    }
    const updatedContacts = [...contactList.contacts, ...newContacts];
    onUpdate(updatedContacts);
    setIsAddingContact(false);
    //toast.success('Contact added successfully');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{contactList.name}</h3>
        <button
          onClick={() => setIsAddingContact(true)}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <UserPlus className="w-5 h-5 mr-1" />
          Add Contact
        </button>
      </div>

      {isAddingContact && (
        <AddContactForm
          onAdd={handleAddContacts}
          onCancel={() => setIsAddingContact(false)}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contactList.contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === contact.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{contact.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === contact.id ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">{contact.email}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === contact.id ? (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900"
                        title="Save"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Cancel"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onDelete}
          className="px-4 py-2 text-red-600 hover:text-red-800"
        >
          Delete List
        </button>
      </div>
    </div>
  );
};