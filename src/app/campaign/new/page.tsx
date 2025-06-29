// pages/campaign/new.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreateCampaignProvider } from '@/hooks/useCreateCampaign';
import { useAuthContext } from '@/hooks/useAuth';
import CampaignCreationWizard from '@/components/campaign-creation/CampaignCreationWizard';
import CampaignCreationSuccess from '@/components/campaign-creation/states/SuccessState';
import { 
  ArrowLeft, 
  Crown, 
  Sparkles,
  Shield,
  Heart,
  Loader2,
  User,
  LogOut
} from 'lucide-react';

// ===========================
// TYPES
// ===========================

interface CampaignCreationState {
  phase: 'creating' | 'success' | 'error';
  campaignData?: any;
  error?: string;
}

// ===========================
// MAIN COMPONENT
// ===========================

const CampaignNewPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout, formatUserName, getUserInitials } = useAuthContext();
  
  const [creationState, setCreationState] = useState<CampaignCreationState>({
    phase: 'creating'
  });

  // ===========================
  // AUTHENTICATION CHECKS
  // ===========================

  useEffect(() => {
    // Se ainda está carregando auth, aguardar
    if (authLoading) return;

    // Se não autenticado, redirecionar para login
    if (!isAuthenticated || !user) {
      router.push('/'); // página de login (conforme visto em src/app/page.tsx)
      return;
    }

    // Log para debug
    console.log('Usuário autenticado:', {
      id: user.id,
      username: user.username,
      email: user.email
    });
  }, [isAuthenticated, user, authLoading, router]);

  // ===========================
  // LOADING STATE
  // ===========================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Verificando autenticação...</h2>
          <p className="text-gray-400">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, não renderizar nada (useEffect vai redirecionar)
  if (!isAuthenticated || !user) {
    return null;
  }

  // ===========================
  // EVENT HANDLERS
  // ===========================

  const handleCampaignCreationComplete = (campaignData: any) => {
    console.log('Campanha criada com sucesso:', campaignData);
    console.log('Criada pelo usuário:', {
      id: user.id,
      username: user.username,
      email: user.email
    });
    
    setCreationState({
      phase: 'success',
      campaignData: {
        ...campaignData,
        game_master_id: user.id, // Garantir que o GM está definido
        created_by: formatUserName()
      }
    });

    // Scroll to top para mostrar a mensagem de sucesso
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateAnother = () => {
    setCreationState({ phase: 'creating' });
  };

  const handleViewCampaign = () => {
    if (creationState.campaignData?.id) {
      router.push(`/campaign/${creationState.campaignData.id}`);
    } else {
      // Fallback se não tiver ID - ir para dashboard ou lista de campanhas
      router.push('/dashboard');
    }
  };

  const handleCancel = () => {
    router.push('/campaigns'); // ou `/dashboard` dependendo da estrutura de rotas
  };

  const handleGoBack = () => {
    router.back();
  };

  // ===========================
  // RENDER SUCCESS STATE
  // ===========================

  if (creationState.phase === 'success') {
    return (
      <CampaignCreationSuccess
        campaignName={creationState.campaignData?.name || 'Nova Campanha'}
        onViewCampaign={handleViewCampaign}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  // ===========================
  // RENDER ERROR STATE
  // ===========================

  if (creationState.phase === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Ops! Algo deu errado
          </h1>
          
          <p className="text-gray-300 mb-8">
            {creationState.error || 'Não foi possível criar sua campanha. Tente novamente.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCreationState({ phase: 'creating' })}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200"
            >
              Tentar Novamente
            </button>
            
            <button
              onClick={handleGoBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // RENDER CREATION WIZARD
  // ===========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header com breadcrumb e dados do usuário */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </button>
              
              <div className="h-6 w-px bg-gray-600"></div>
              
              <nav className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Campanhas</span>
                <span className="text-gray-600">/</span>
                <span className="text-white font-medium">Nova Campanha</span>
              </nav>
            </div>

            <div className="flex items-center space-x-6">
              {/* Informações do usuário */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-white text-sm font-medium">
                    {formatUserName()}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Mestre da Campanha
                  </p>
                </div>
              </div>

              {/* Criador de Campanhas */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-400 font-semibold text-sm">Criador de Campanhas</span>
              </div>

              {/* Botão de Logout */}
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section personalizada */}
      <section className="relative py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative inline-block">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-yellow-500 rounded-full animate-pulse opacity-60"></div>
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Crie Sua Campanha Épica, {formatUserName()}!
          </h1>
          
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            Transforme suas ideias em aventuras inesquecíveis. 
            Com nosso assistente, criar uma campanha nunca foi tão fácil.
          </p>

          {/* Estatísticas do usuário */}
          <div className="inline-flex items-center space-x-4 px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-8">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 text-sm">
                <strong>{user.username}</strong> como Mestre
              </span>
            </div>
            <div className="w-px h-4 bg-blue-500/30"></div>
            <div className="text-blue-300 text-sm">
              ID: <span className="font-mono text-xs">{user.id.slice(0, 8)}...</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Wizard Intuitivo</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Validação Inteligente</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span>Feito com Amor</span>
            </div>
          </div>
        </div>
      </section>

      {/* Wizard Container com dados do usuário */}
      <section className="pb-12">
        <CreateCampaignProvider>
          <CampaignCreationWizard
            onComplete={handleCampaignCreationComplete}
            onCancel={handleCancel}
            // Passando dados do usuário para o wizard
            gamemaster={{
              id: user.id,
              username: user.username,
              email: user.email
            }}
          />
        </CreateCampaignProvider>
        
        {/* Debug info - remover em produção */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-4xl mx-auto mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Debug - Dados do Usuário</h3>
            <pre className="text-gray-300 text-sm overflow-x-auto">
              {JSON.stringify({
                id: user.id,
                username: user.username,
                email: user.email,
                isAuthenticated,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
            <p className="text-gray-400 text-xs mt-2">
              <strong>Para desenvolvedores:</strong> O hook useCreateCampaign pode acessar esses dados via useAuthContext() 
              para definir automaticamente o game_master_id na criação da campanha.<br/>
              <strong>Exemplo:</strong> const &#123; user &#125; = useAuthContext(); formData.game_master_id = user.id;
            </p>
          </div>
        )}
      </section>

      {/* Footer inspiracional personalizado */}
      <footer className="border-t border-gray-700/50 bg-gray-900/30 backdrop-blur-sm py-8">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-gray-400 text-sm mb-2">
            "As melhores aventuras começam com um grande mestre e uma campanha bem planejada."
          </p>
          <p className="text-gray-500 text-xs mb-4">
            — Sabedoria dos Antigos Mestres
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>Bem-vindo, <strong className="text-gray-400">{formatUserName()}</strong></span>
            <span>•</span>
            <span>Sua jornada como Mestre começa aqui</span>
            <span>•</span>
            <span>RPG Creator v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};



// ===========================
// EXPORT
// ===========================

export default CampaignNewPage;