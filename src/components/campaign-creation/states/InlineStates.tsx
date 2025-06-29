// src/components/campaign-creation/states/InlineStates.tsx
"use client";
import React from 'react';
import { Loader2 } from 'lucide-react';

interface InlineLoadingProps {
  text?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({ text = "Carregando..." }) => {
  return (
    <div className="flex items-center space-x-2 text-gray-400">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  );
};

export const CampaignPreviewSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
        <div className="h-6 bg-gray-700 rounded w-48"></div>
      </div>
      
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <div className="h-6 bg-gray-700 rounded-full w-16"></div>
        <div className="h-6 bg-gray-700 rounded-full w-20"></div>
        <div className="h-6 bg-gray-700 rounded-full w-14"></div>
      </div>
    </div>
  );
};