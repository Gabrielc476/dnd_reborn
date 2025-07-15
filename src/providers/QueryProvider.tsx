// ===========================
// QUERY PROVIDER - CONFIGURAÇÃO COMPLETA DO REACT QUERY
// src/providers/QueryProvider.tsx
// ===========================

"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Configurações de cache
        staleTime: 5 * 60 * 1000, // 5 minutos - dados são considerados "fresh"
        gcTime: 10 * 60 * 1000, // 10 minutos - dados ficam em cache após serem "stale"
        
        // Configurações de retry
        retry: (failureCount, error) => {
          // Não tentar novamente para erros 4xx (exceto 401)
          if (error instanceof Error && error.message.includes('401')) {
            return false; // Token expirado - não retry
          }
          if (error instanceof Error && error.message.includes('4')) {
            return false; // Outros erros 4xx - não retry
          }
          return failureCount < 3; // Máximo 3 tentativas para outros erros
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Configurações de refetch
        refetchOnWindowFocus: false, // Não refetch quando janela ganha foco
        refetchOnMount: true, // Refetch quando componente monta
        refetchOnReconnect: true, // Refetch quando conexão é restaurada
        
        // Configurações de rede
        networkMode: 'online', // Só fazer queries quando online
      },
      mutations: {
        // Configurações para mutations
        retry: 1, // Apenas 1 retry para mutations
        retryDelay: 1000, // 1 segundo entre tentativas
        networkMode: 'online',
        
        // Configurações globais de erro
        onError: (error) => {
          console.error('Erro na mutation:', error);
          
          // Se for erro de autenticação, redirecionar para login
          if (error instanceof Error && error.message.includes('401')) {
            localStorage.removeItem('auth_token');
            window.location.href = '/';
          }
        },
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {/* Devtools apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}