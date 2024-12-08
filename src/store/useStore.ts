import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Template, EmailContact, Campaign, SmtpConfig } from '../types';

interface Store {
  templates: Template[];
  contacts: EmailContact[];
  campaigns: Campaign[];
  smtpConfig: SmtpConfig;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  importContacts: (contacts: EmailContact[]) => void;
  updateContact: (contact: EmailContact) => void;
  deleteContact: (id: string) => void;
  createCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  updateSmtpConfig: (config: Partial<SmtpConfig>) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      templates: [],
      contacts: [],
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
      importContacts: (contacts) => set({ contacts }),
      updateContact: (contact) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === contact.id ? contact : c
          ),
        })),
      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
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
      name: 'email-campaign-storage',
    }
  )
);