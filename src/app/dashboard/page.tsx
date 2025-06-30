// ===========================
// DASHBOARD PAGE - MAIN ROUTE
// src/app/dashboard/page.tsx
// ===========================

"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthContext();

  // Redirecionamento se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Verificando acesso...</h2>
          <p className="text-gray-400">Preparando seu dashboard</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, não renderizar nada (redirecionamento acontecerá)
  if (!isAuthenticated) {
    return null;
  }

  // Renderizar dashboard principal
  return <Dashboard />;
}