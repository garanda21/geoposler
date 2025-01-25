import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, CheckCircle, Trash2, Info, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendEmail } from '../utils/emailService';
import { ErrorDetails } from './ErrorDetails';
import { Campaign } from '../types';
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
  const [selectedContactListId, setSelectedContactListId] = useState('');
  const [subject, setSubject] = useState('');
  const [showErrors, setShowErrors] = useState<string | null>(null);

  const handleCreateCampaign = () => {
    if (!newCampaignName || !selectedTemplateId || !selectedContactListId || !subject) {
      toast.error(t('campaigns.messages.fillFields'));
      return;
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    const selectedContactList = contactLists.find(cl => cl.id === selectedContactListId);
    
    if (!selectedTemplate || !selectedContactList) {
      toast.error(t('campaigns.messages.notFound'));
      return;
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaignName,
      subject,
      templateId: selectedTemplateId,
      templateName: selectedTemplate.name,
      contactListId: selectedContactListId,
      contactListName: selectedContactList.name,
      status: 'draft',
      sentCount: 0,
      totalCount: selectedContactList.contacts.length,
      createDate: new Date().toISOString()
    };

    createCampaign(campaign);
    setNewCampaignName('');
    setSelectedTemplateId('');
    setSelectedContactListId('');
    setSubject('');
    toast.success(t('campaigns.messages.createSuccess'));
  };

  const handleStartCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    const template = templates.find(t => t.id === campaign?.templateId);
    const contactList = contactLists.find(cl => cl.id === campaign?.contactListId);
    
    if (!campaign || !template || !contactList) {
      toast.error(t('campaigns.messages.notFound'));
      return;
    }

    if (!smtpConfig.host || !smtpConfig.username || !smtpConfig.password) {
      toast.error(t('campaigns.messages.configureSmtp'));
      return;
    }

    if (!contactList.contacts.length) {
      toast.error(t('campaigns.messages.noContacts'));
      return;
    }

    updateCampaign(campaignId, { status: 'sending', sentCount: 0 });

    let successCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

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
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('campaigns.newCampaign.contactList')}</label>
            <select
              value={selectedContactListId}
              onChange={(e) => setSelectedContactListId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">{t('campaigns.newCampaign.selectContactList')}</option>
              {contactLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.contacts.length} {t('campaigns.newCampaign.contactCount')})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateCampaign}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {t('campaigns.newCampaign.createButton')}
          </button>
        </div>
      </div>

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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {campaign.contactListName}
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