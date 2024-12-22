import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Template, Campaign, ContactList, SmtpConfig } from '../types';

interface Store {
  templates: Template[];
  contactLists: ContactList[];
  campaigns: Campaign[];
  smtpConfig: SmtpConfig;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  addContactList: (contactList: ContactList) => void;
  updateContactList: (id: string, contactList: Partial<ContactList>) => void;
  deleteContactList: (id: string) => void;
  createCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  updateSmtpConfig: (config: Partial<SmtpConfig>) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      templates: [],
      contactLists: [],
      campaigns: [],
      smtpConfig: {
        host: '',
        port: 587,
        username: '',
        password: '',
        fromEmail: '',
        fromName: '',
      },
      addTemplate: (template) =>
        set((state) => ({ templates: [...state.templates, template] })),
      updateTemplate: (id, template) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...template } : t
          ),
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
      addContactList: (contactList) =>
        set((state) => ({ contactLists: [...state.contactLists, contactList] })),
      updateContactList: (id, contactList) =>
        set((state) => ({
          contactLists: state.contactLists.map((cl) =>
            cl.id === id ? { ...cl, ...contactList } : cl
          ),
        })),
      deleteContactList: (id) =>
        set((state) => ({
          contactLists: state.contactLists.filter((cl) => cl.id !== id),
        })),
      createCampaign: (campaign) =>
        set((state) => ({ campaigns: [...state.campaigns, campaign] })),
      updateCampaign: (id, campaign) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...campaign } : c
          ),
        })),
      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        })),
      updateSmtpConfig: (config) =>
        set((state) => ({ smtpConfig: { ...state.smtpConfig, ...config } })),
    }),
    {
      name: 'email-campaign-storage'      
    }
  )
);