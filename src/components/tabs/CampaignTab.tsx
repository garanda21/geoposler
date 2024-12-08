import React from 'react';
import { CampaignManager } from '../CampaignManager';

export const CampaignTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Contact List</h2>
      <CampaignManager />
    </div>
  );
};