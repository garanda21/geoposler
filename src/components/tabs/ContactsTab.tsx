import React from 'react';
import { ContactsUploader } from '../ContactsUploader';
import { ContactsList } from '../ContactsList';

export const ContactsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Contact List</h2>
      <ContactsUploader />
      <ContactsList />
    </div>
  );
};