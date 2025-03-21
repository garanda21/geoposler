import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Template, Campaign, ContactList, SmtpConfig } from '../types';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

type ActionType = 
    | 'ADD_TEMPLATE' 
    | 'UPDATE_TEMPLATE' 
    | 'DELETE_TEMPLATE'
    | 'ADD_CONTACT_LIST'
    | 'UPDATE_CONTACT_LIST'
    | 'DELETE_CONTACT_LIST'
    | 'ADD_CAMPAIGN'
    | 'UPDATE_CAMPAIGN'
    | 'DELETE_CAMPAIGN';

  interface SaveSettingsAction {
    type: ActionType;
    data: any;  // This could be Template, ContactList, Campaign, etc.
  }

interface Store {
  isLoading: boolean;
  error: string | null;
  templates: Template[];
  contactLists: ContactList[];
  campaigns: Campaign[];
  smtpConfig: SmtpConfig;
  // Action types for saveSettings
  
  
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
  saveSettings: (action?: SaveSettingsAction) => Promise<void>;
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
        useSSL: false,
        useAuth: false,
      },
      addTemplate: async (template) => {
        set((state) => ({ templates: [...state.templates, template] }));
        await get().saveSettings({
          type: 'ADD_TEMPLATE',
          data: template
        });
    },
      updateTemplate: async (id, template) => {
        try {
          set((state) => ({
            templates: state.templates.map((t) =>
              t.id === id ? { ...t, ...template } : t
            ),
          }));
          await get().saveSettings({
            type: 'UPDATE_TEMPLATE',
            data: { id, ...template }
          });
        } catch (error) {                    
          throw error; // Re-throw to be caught by the component
        }
      },
      deleteTemplate: async (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
        await get().saveSettings({
          type: 'DELETE_TEMPLATE',
          data: { id }
        });
      },
      addContactList: async (contactList) => {
        set((state) => ({ contactLists: [...state.contactLists, contactList] }));
        await get().saveSettings({
          type: 'ADD_CONTACT_LIST',
          data: contactList
        });
    },
      updateContactList: async (id, contactList) => {
        set((state) => ({
          contactLists: state.contactLists.map((cl) =>
            cl.id === id ? { ...cl, ...contactList } : cl
          ),
        }));
        await get().saveSettings({
          type: 'UPDATE_CONTACT_LIST',
          data: { id, ...contactList }
        });
      },
      deleteContactList: async (id) => {
        set((state) => ({
          contactLists: state.contactLists.filter((cl) => cl.id !== id),
        }));
        await get().saveSettings({
          type: 'DELETE_CONTACT_LIST',
          data: { id }
        });
      },
      createCampaign: async (campaign) => {
        set((state) => ({ campaigns: [...state.campaigns, campaign] }));
        await get().saveSettings({
          type: 'ADD_CAMPAIGN',
          data: campaign
        });
    },
      updateCampaign: async (id, campaign) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...campaign } : c
          ),
        }));
        await get().saveSettings({
          type: 'UPDATE_CAMPAIGN',
          data: { id, ...campaign }
        });
      },
      deleteCampaign: async (id) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id)
        }));
        await get().saveSettings({
          type: 'DELETE_CAMPAIGN',
          data: { id }
        });
      },
      updateSmtpConfig: async (config) => {
        set((state) => ({ smtpConfig: { ...state.smtpConfig, ...config } }));
        await get().saveSettings();
      },
      fetchSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.get('/settings');
          set(response.data);
        } catch (error) {
          set({ error: 'Failed to fetch settings' });
          console.error('Failed to fetch settings:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      saveSettings: async (action?: SaveSettingsAction) => {
        try {
          set({ isLoading: true, error: null });
          const state = get();
          await api.post('/settings', {
            smtpConfig: state.smtpConfig,
            action,
            data: action?.data
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to save settings' });          
          console.error('Failed to save settings:', error);
          throw error; // Make sure to re-throw for the component to catch
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