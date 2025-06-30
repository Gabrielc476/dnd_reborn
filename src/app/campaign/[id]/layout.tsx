"use client";

import React, { use } from 'react';
import { ManageCampaignProvider } from '@/hooks/useManageCampaign';

interface CampaignLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export default function CampaignLayout({ 
  children, 
  params 
}: CampaignLayoutProps) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params);
  
  return (
    <ManageCampaignProvider campaignId={id}>
      {children}
    </ManageCampaignProvider>
  );
}