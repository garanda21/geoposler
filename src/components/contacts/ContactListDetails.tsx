import React, { useState } from 'react';
import { ContactList, EmailContact } from '../../types';
import { Pencil, Trash2, Save, X, UserPlus, Download } from 'lucide-react';
import { AddContactForm } from './AddContactForm';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EmailContact>({ id: '', name: '', email: '' });
  const [isAddingContact, setIsAddingContact] = useState(false);

  const handleEdit = (contact: EmailContact) => {
    setEditingId(contact.id);
    setEditForm(contact);
  };

  const handleSave = () => {
    if (!editForm.name || !editForm.email) {
      toast.error(t('contacts.addContact.validation.nameEmail'));
      return;
    }

    if (!editForm.email.includes('@')) {
      toast.error(t('contacts.addContact.validation.validEmail'));
      return;
    }

    const updatedContacts = contactList.contacts.map((c) =>
      c.id === editForm.id ? editForm : c
    );
    onUpdate(updatedContacts);
    setEditingId(null);
    toast.success(t('contacts.list.messages.updateSuccess'));
  };

  const handleDelete = (id: string) => {
    const updatedContacts = contactList.contacts.filter((c) => c.id !== id);
    onUpdate(updatedContacts);
    toast.success(t('contacts.list.messages.deleteContactSuccess'));
  };

  const handleAddContacts = (newContacts: EmailContact[]) => {
    if (newContacts.length === 1 && contactList.contacts.some(existing => 
      existing.email.toLowerCase() === newContacts[0].email.toLowerCase()
    )) {
      toast.error(t('contacts.list.messages.duplicateEmail'), {duration: 5000});
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
    if (newContacts.length === 1) {
      toast.success(t('contacts.list.messages.contactAdded'));
    }
  };
  
  const handleExportCSV = () => {
    try {
      // Generar contenido CSV a partir de la lista de contactos
      const csvContent = contactList.contacts
        .map(contact => `${contact.name};${contact.email}`)
        .join('\n');
      
      // Crear un blob con el contenido CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Crear un objeto URL para el blob
      const url = URL.createObjectURL(blob);
      
      // Crear un enlace temporal para la descarga
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${contactList.name}.csv`);
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{contactList.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
            title={t('contacts.list.actions.exportCSV') || 'Exportar a CSV'}
          >
            <Download className="w-5 h-5 mr-1" />
            {t('contacts.list.actions.exportCSV') || 'Exportar CSV'}
          </button>
          <button
            onClick={() => setIsAddingContact(true)}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <UserPlus className="w-5 h-5 mr-1" />
            {t('contacts.list.actions.addContact')}
          </button>
        </div>
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
                {t('contacts.list.columns.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('contacts.list.columns.email')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('contacts.list.columns.actions')}
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
                        title={t('contacts.list.actions.save')}
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900"
                        title={t('contacts.list.actions.cancel')}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title={t('contacts.list.actions.edit')}
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-900"
                        title={t('contacts.list.actions.delete')}
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
          {t('contacts.list.actions.deleteList')}
        </button>
      </div>
    </div>
  );
};