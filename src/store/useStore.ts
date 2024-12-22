import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Template, Campaign, ContactList, SmtpConfig } from '../types';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface Store {
  isLoading: boolean;
  error: string | null;
  templates: Template[];
  contactLists: ContactList[];
  campaigns: Campaign[];
  smtpConfig: SmtpConfig;
  addTemplate: (template: Template) => Promise<void>;
  updateTemplate: (id: string, template: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  addContactList: (contactList: ContactList) => Promise<void>;
  updateContactList: (id: string, contactList: Partial<ContactList>) => Promise<void>;
  deleteContactList: (id: string) => Promise<void>;
  createCampaign: (campaign: Campaign) => Promise<void>;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  updateSmtpConfig: (config: SmtpConfig) => Promise<void>;
  fetchSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
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
      addTemplate: async (template) => {
        set((state) => ({ templates: [...state.templates, template] }));
      await get().saveSettings();
    },
      updateTemplate: async (id, template) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...template } : t
          ),
        }));
        await get().saveSettings();
      },
      deleteTemplate: async (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
        await get().saveSettings();
      },
      addContactList: async (contactList) => {
        set((state) => ({ contactLists: [...state.contactLists, contactList] }));
      await get().saveSettings();
    },
      updateContactList: async (id, contactList) => {
        set((state) => ({
          contactLists: state.contactLists.map((cl) =>
            cl.id === id ? { ...cl, ...contactList } : cl
          ),
        }));
        await get().saveSettings();
      },
      deleteContactList: async (id) => {
        set((state) => ({
          contactLists: state.contactLists.filter((cl) => cl.id !== id),
        }));
        await get().saveSettings();
      },
      createCampaign: async (campaign) => {
        set((state) => ({ campaigns: [...state.campaigns, campaign] }));
      await get().saveSettings();
    },
      updateCampaign: async (id, campaign) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...campaign } : c
          ),
        }));
        await get().saveSettings();
      },
      deleteCampaign: async (id) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id)
        }));
        await get().saveSettings();
      },
      updateSmtpConfig: async (config) => {
        set((state) => ({ smtpConfig: { ...state.smtpConfig, ...config } }));
        await get().saveSettings();
      },
      fetchSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.get(`${API_URL}/api/settings`);
          set(response.data);
        } catch (error) {
          set({ error: 'Failed to fetch settings' });
          console.error('Failed to fetch settings:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      saveSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          const state = get();
          await axios.post(`${API_URL}/api/settings`, {
            templates: state.templates,
            contactLists: state.contactLists,
            campaigns: state.campaigns,
            smtpConfig: state.smtpConfig,
          });
        } catch (error) {
          set({ error: 'Failed to save settings' });          
          console.error('Failed to save settings:', error);
          throw error; // Re-throw to handle in component
        } finally {
          set({ isLoading: false });
        }
      },
      isLoading: false,
      error: null,
      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'email-campaign-storage',
      // Add onRehydrateStorage to handle post-rehydration tasks
      onRehydrateStorage: () => (state) => {
        // Optionally fetch fresh data after rehydration
        if (state) {
          state.fetchSettings();
        }
      }   
    }
  )
);