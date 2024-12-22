import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendEmail } from '../utils/emailService';

export const CampaignManager: React.FC = () => {
  const { templates, contactLists, campaigns, createCampaign, updateCampaign, deleteCampaign, smtpConfig } = useStore();
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedContactListId, setSelectedContactListId] = useState('');
  const [subject, setSubject] = useState('');

  const handleCreateCampaign = () => {
    if (!newCampaignName || !selectedTemplateId || !selectedContactListId || !subject) {
      toast.error('Please fill in all fields');
      return;
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    const selectedContactList = contactLists.find(cl => cl.id === selectedContactListId);
    
    if (!selectedTemplate || !selectedContactList) {
      toast.error('Selected template or contact list not found');
      return;
    }

    const campaign = {
      id: Date.now().toString(),
      name: newCampaignName,
      subject,
      templateId: selectedTemplateId,
      templateName: selectedTemplate.name,
      contactListId: selectedContactListId,
      contactListName: selectedContactList.name,
      status: 'draft' as const,
      sentCount: 0,
      totalCount: selectedContactList.contacts.length,
    };

    createCampaign(campaign);
    setNewCampaignName('');
    setSelectedTemplateId('');
    setSelectedContactListId('');
    setSubject('');
    toast.success('Campaign created successfully');
  };

  const handleStartCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    const template = templates.find(t => t.id === campaign?.templateId);
    const contactList = contactLists.find(cl => cl.id === campaign?.contactListId);
    
    if (!campaign || !template || !contactList) {
      toast.error('Campaign, template, or contact list not found');
      return;
    }

    if (!smtpConfig.host || !smtpConfig.username || !smtpConfig.password) {
      toast.error('Please configure SMTP settings first');
      return;
    }

    if (!contactList.contacts.length) {
      toast.error('No contacts available to send to');
      return;
    }

    updateCampaign(campaignId, { status: 'sending', sentCount: 0 });

    let successCount = 0;
    let hasError = false;

    for (const contact of contactList.contacts) {
      const personalizedContent = template.content.replace(/\{\{name\}\}/g, contact.name);
      
      const result = await sendEmail(
        contact,
        campaign.subject,
        personalizedContent,
        smtpConfig
      );

      if (result.success) {
        successCount++;
        updateCampaign(campaignId, {
          sentCount: successCount,
        });
      } else {
        hasError = true;
        updateCampaign(campaignId, {
          status: 'failed',
          error: result.error
        });
        toast.error(`Failed to send to ${contact.email}: ${result.error}`);
        break;
      }
    }

    if (!hasError) {
      updateCampaign(campaignId, {
        status: 'completed',
        sentCount: successCount
      });
      toast.success(`Campaign completed: ${successCount} emails sent successfully`);
    }
  };

  const handlePauseCampaign = (campaignId: string) => {
    updateCampaign(campaignId, { status: 'draft' });
    toast.success('Campaign paused');
  };

  const handleDeleteCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign?.status === 'sending') {
      toast.error('Cannot delete a campaign while it is sending');
      return;
    }
    deleteCampaign(campaignId);
    toast.success('Campaign deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Create New Campaign</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <input
              type="text"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact List</label>
            <select
              value={selectedContactListId}
              onChange={(e) => setSelectedContactListId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a contact list</option>
              {contactLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.contacts.length} contacts)
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateCampaign}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Campaign
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact List
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-500">{campaign.subject}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {campaign.templateName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {campaign.contactListName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      campaign.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : campaign.status === 'sending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : campaign.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.status}
                  </span>
                  {campaign.error && (
                    <div className="text-xs text-red-600 mt-1">{campaign.error}</div>
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
                      title="Start Campaign"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  )}
                  {campaign.status === 'sending' && (
                    <button
                      onClick={() => handlePauseCampaign(campaign.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Pause Campaign"
                    >
                      <Pause className="h-5 w-5" />
                    </button>
                  )}
                  {campaign.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {campaign.status === 'failed' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  {campaign.status !== 'sending' && (
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="text-red-600 hover:text-red-900 ml-2"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};