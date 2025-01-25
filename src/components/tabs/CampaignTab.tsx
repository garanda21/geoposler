import React from 'react';
import { useTranslation } from 'react-i18next';
import { CampaignManager } from '../CampaignManager';


export const CampaignTab: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t('campaigns.title')}</h2>
      <CampaignManager />
    </div>
  );
};