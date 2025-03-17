import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, CheckCircle, Trash2, Info, RotateCw, X, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendEmail } from '../utils/emailService';
import { ErrorDetails } from './ErrorDetails';
import { Campaign, ContactList } from '../types';
import { format, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';

export const CampaignManager: React.FC = () => {
  const { t } = useTranslation();
  const { 
    templates, 
    contactLists, 
    campaigns, 
    smtpConfig,
    createCampaign, 
    updateCampaign, 
    deleteCampaign 
  } = useStore();

  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedContactListIds, setSelectedContactListIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [showErrors, setShowErrors] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCreateCampaign = () => {
    if (!newCampaignName || !selectedTemplateId || selectedContactListIds.length === 0 || !subject) {
      toast.error(t('campaigns.messages.fillFields'));
      return;
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    const selectedContactLists = contactLists.filter(cl => selectedContactListIds.includes(cl.id));
    
    if (!selectedTemplate || selectedContactLists.length === 0) {
      toast.error(t('campaigns.messages.notFound'));
      return;
    }

    // Calculate total contacts across all selected contact lists
    const totalContacts = selectedContactLists.reduce((sum, list) => sum + list.contacts.length, 0);

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaignName,
      subject,
      templateId: selectedTemplateId,
      templateName: selectedTemplate.name,
      contactListIds: selectedContactLists.map(list => list.id),
      contactListNames: selectedContactLists.map(list => list.name),
      status: 'draft',
      sentCount: 0,
      totalCount: totalContacts,
      createDate: new Date().toISOString()
    };

    createCampaign(campaign);
    setNewCampaignName('');
    setSelectedTemplateId('');
    setSelectedContactListIds([]);
    setSubject('');
    toast.success(t('campaigns.messages.createSuccess'));
  };

  const handleStartCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    const template = templates.find(t => t.id === campaign?.templateId);
    const selectedContactLists = contactLists.filter(cl => campaign?.contactListIds.includes(cl.id));
    
    if (!campaign || !template) {
      toast.error(t('campaigns.messages.notFound'));
      return;
    }

    // Validate that the template content is not empty
    if (!template.content || template.content.trim() === '') {
      toast.error(t('campaigns.messages.emptyTemplate'));
      return;
    }

    if (!smtpConfig.host) {
      toast.error(t('campaigns.messages.configureSmtp'));
      return;
    }

    if (smtpConfig.useAuth && (!smtpConfig.username || !smtpConfig.password)) {
      toast.error(t('campaigns.messages.smtpAuth'));
      return;
    }

    // Check if all contact lists have contacts
    const hasContacts = selectedContactLists.every(list => list.contacts.length > 0);
    if (!hasContacts) {
      toast.error(t('campaigns.messages.noContacts'));
      return;
    }

    updateCampaign(campaignId, { status: 'sending', sentCount: 0 });

    let successCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    // Process contacts from all selected contact lists
    for (const contactList of selectedContactLists) {
      for (const contact of contactList.contacts) {
        try {
          const personalizedContent = template.content.replace(/\{\{name\}\}/g, contact.name);
          
          const result = await sendEmail(
            contact,
            campaign.subject,
            personalizedContent,
            smtpConfig
          );

          if (result.success) {
            successCount++;
          } else {
            errors.push({ email: contact.email, error: result.error || 'Unknown error' });
          }
          
          updateCampaign(campaignId, {
            sentCount: successCount,
          });
        } catch (error: any) {
          errors.push({ 
            email: contact.email, 
            error: error.message || 'Unknown error' 
          });
        }
      }
    }

    const status = errors.length > 0 
    ? (successCount === 0 ? 'failed' : 'completed with errors') 
    : 'completed';
    updateCampaign(campaignId, {
      status,
      sentCount: successCount,
      error: errors.length > 0 ? JSON.stringify(errors) : undefined
    });

    if (errors.length > 0) {
      toast.error(t('campaigns.messages.completedWithErrors', { 0: errors.length, 1: successCount }));
    } else {
      toast.success(t('campaigns.messages.completedSuccess', { 0: successCount }));
    }
  };

  const handleContactListToggle = (id: string) => {
    setSelectedContactListIds(prev => 
      prev.includes(id) 
        ? prev.filter(listId => listId !== id) 
        : [...prev, id]
    );
  };

  const handleRemoveContactList = (id: string) => {
    setSelectedContactListIds(prev => prev.filter(listId => listId !== id));
  };

  const handlePauseCampaign = (campaignId: string) => {
    updateCampaign(campaignId, { status: 'draft' });
    toast.success(t('campaigns.messages.pauseSuccess'));
  };

  const handleDeleteCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign?.status === 'sending') {
      toast.error(t('campaigns.messages.cantDelete'));
      return;
    }
    deleteCampaign(campaignId);
    toast.success(t('campaigns.messages.deleteSuccess'));
  };

  // Calculate total contacts in selected lists
  const totalSelectedContacts = contactLists
    .filter(cl => selectedContactListIds.includes(cl.id))
    .reduce((sum, list) => sum + list.contacts.length, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">{t('campaigns.newCampaign.title')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('campaigns.newCampaign.name')}</label>
            <input
              type="text"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('campaigns.newCampaign.subject')}</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('campaigns.newCampaign.template')}</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">{t('campaigns.newCampaign.selectTemplate')}</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Custom contact list multi-select dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('campaigns.newCampaign.contactList')}
            </label>
            
            {/* Dropdown container */}
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown trigger button */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left 
                  focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                aria-haspopup="listbox"
              >
                <span className="block truncate">
                  {selectedContactListIds.length === 0 
                    ? t('campaigns.newCampaign.selectContactList')
                    : `${selectedContactListIds.length} ${t('campaigns.newCampaign.listsSelected')}`}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </span>
              </button>
              
              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {contactLists.length === 0 ? (
                    <div className="py-2 px-3 text-gray-500">
                      {t('campaigns.newCampaign.noContactLists')}
                    </div>
                  ) : (
                    contactLists.map(list => (
                      <div
                        key={list.id}
                        onClick={() => handleContactListToggle(list.id)}
                        className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                          selectedContactListIds.includes(list.id) ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-4 w-4 mr-2">
                            {selectedContactListIds.includes(list.id) && (
                              <Check className="h-4 w-4 text-indigo-600" />
                            )}
                          </div>
                          <span className="font-normal block truncate">
                            {list.name} <span className="text-gray-500 text-xs">({list.contacts.length} {t('campaigns.newCampaign.contactCount')})</span>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {/* Selected contact list tags */}
            {selectedContactListIds.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedContactListIds.map(id => {
                    const list = contactLists.find(cl => cl.id === id);
                    return list ? (
                      <div 
                        key={list.id} 
                        className="flex items-center bg-indigo-100 text-indigo-800 rounded px-2 py-1"
                      >
                        <span>{list.name} ({list.contacts.length})</span>
                        <button 
                          onClick={() => handleRemoveContactList(list.id)}
                          className="ml-1 text-indigo-600 hover:text-indigo-900"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="text-sm text-gray-500">
                  {t('campaigns.newCampaign.totalContacts')}: {totalSelectedContacts}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleCreateCampaign}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {t('campaigns.newCampaign.createButton')}
          </button>
        </div>
      </div>

      {/* Campaign table section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('campaigns.table.campaign')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('campaigns.table.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('campaigns.table.template')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('campaigns.table.contactList')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('campaigns.table.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('campaigns.table.progress')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('campaigns.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {campaigns.map((campaign) => {
            const parsedDate = campaign.createDate
              ? parse(campaign.createDate, 'dd/MM/yyyy HH:mm:ss', new Date())
              : null;
            
            // Handle displaying multiple contact list names - fixed to handle legacy data
            const contactListsDisplay = Array.isArray(campaign.contactListNames) 
              ? campaign.contactListNames.join(', ') 
              : (campaign as any).contactListName || ''; // Safe cast for backward compatibility

            return (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-wrap">
                  <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-500">{campaign.subject}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {parsedDate && parsedDate?.getTime() > 0 ? format(parsedDate, 'dd/MM/yyyy') : '-'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {parsedDate && parsedDate?.getTime() > 0 ? format(parsedDate, 'HH:mm:ss') : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {campaign.templateName}
                </td>
                <td className="px-6 py-4 whitespace-wrap text-sm text-gray-500">
                  {contactListsDisplay}
                </td>
                <td className="px-6 py-4 whitespace-wrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      campaign.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : campaign.status === 'sending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : campaign.status === 'completed with errors'
                        ? 'bg-orange-100 text-orange-800'
                        : campaign.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {t(`campaigns.status.${campaign.status.replace(/\s+/g, '')}`)}
                  </span>
                  {campaign.error && (
                    <button
                      onClick={() => setShowErrors(campaign.id)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      title={t('campaigns.actions.viewErrors')}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {campaign.sentCount} / {campaign.totalCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleStartCampaign(campaign.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title={t('campaigns.actions.start')}
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  )}
                  {campaign.status === 'sending' && (
                    <button
                      onClick={() => handlePauseCampaign(campaign.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title={t('campaigns.actions.pause')}
                    >
                      <Pause className="h-5 w-5" />
                    </button>
                  )}
                  {campaign.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {campaign.status === 'failed' && (
                    <button
                      onClick={() => handleStartCampaign(campaign.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title={t('campaigns.actions.retry')}
                    >
                      <RotateCw className="h-5 w-5 text-red-600" />
                    </button>
                  )}
                  {campaign.status !== 'sending' && (
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="text-red-600 hover:text-red-900 ml-2"
                      title={t('campaigns.actions.delete')}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>

      {showErrors && (
        <ErrorDetails
          errors={JSON.parse(campaigns.find(c => c.id === showErrors)?.error || '[]')}
          onClose={() => setShowErrors(null)}
        />
      )}
    </div>
  );
};