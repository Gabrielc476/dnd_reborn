import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  Calendar as CalendarCheck,
  TrendingUp,
  Play,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { GameSession, CreateSessionRequest } from '@/types/manageCampaign';

export const SessionsHistory: React.FC = () => {
  const { campaign, dashboard, createSession, isGM } = useManageCampaignContext();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'scheduled'>('all');

  useEffect(() => {
    loadSessions();
  }, [campaign?.id, dashboard]);

  const loadSessions = async () => {
    // Em produção, buscar sessões da API
    // Por enquanto, usar dados do dashboard se disponível
    const allSessions = [
      ...(dashboard?.upcoming_sessions || []),
      // Aqui viriam as sessões passadas da API
    ];
    setSessions(allSessions);
  };

  const handleCreateSession = async () => {
    const sessionData: CreateSessionRequest = {
      title: `Sessão ${(sessions.length || 0) + 1}`,
      summary: 'Nova sessão da campanha',
      date: new Date().toISOString(),
      duration_minutes: 240,
      gm_notes: 'Notas do GM para a sessão'
    };

    const sessionId = await createSession(sessionData);
    
    if (sessionId) {
      await loadSessions();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const getSessionStatus = (session: GameSession) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    
    if (session.is_completed) {
      return { status: 'completed', color: 'text-green-400', bg: 'bg-green-500/10' };
    } else if (sessionDate < now) {
      return { status: 'missed', color: 'text-red-400', bg: 'bg-red-500/10' };
    } else {
      return { status: 'scheduled', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return session.is_completed;
    if (filterStatus === 'scheduled') return !session.is_completed;
    return true;
  });

  // Calcular estatísticas
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.is_completed).length;
  const totalPlaytime = sessions
    .filter(s => s.is_completed)
    .reduce((sum, s) => sum + s.duration_minutes, 0);
  const averageSessionLength = completedSessions > 0 ? totalPlaytime / completedSessions : 0;
  const totalXP = sessions
    .filter(s => s.is_completed)
    .reduce((sum, s) => sum + (s.experience_awarded || 0), 0);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Histórico de Sessões</h3>
          <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded-full">
            {totalSessions} sessões
          </span>
        </div>
        
        {isGM && (
          <button
            onClick={handleCreateSession}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Sessão</span>
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-purple-400">{totalSessions}</div>
          <div className="text-xs text-gray-400">Total de Sessões</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-blue-400">
            {Math.floor(totalPlaytime / 60)}h
          </div>
          <div className="text-xs text-gray-400">Tempo Total</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-green-400">
            {Math.floor(averageSessionLength / 60)}h {Math.floor(averageSessionLength % 60)}min
          </div>
          <div className="text-xs text-gray-400">Duração Média</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-yellow-400">
            {totalXP.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">XP Total</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filterStatus === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilterStatus('scheduled')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filterStatus === 'scheduled' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Agendadas
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filterStatus === 'completed' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Concluídas
        </button>
      </div>

      {/* Lista de Sessões */}
      <div className="space-y-4">
        {filteredSessions.length > 0 ? filteredSessions.map((session, index) => {
          const sessionStatus = getSessionStatus(session);
          
          return (
            <div key={session.id || index} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-white">{session.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${sessionStatus.bg} ${sessionStatus.color}`}>
                      {session.is_completed ? 'Concluída' : 'Agendada'}
                    </span>
                    {session.session_number && (
                      <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full">
                        #{session.session_number}
                      </span>
                    )}
                  </div>
                  
                  {session.summary && (
                    <p className="text-sm text-gray-400 mb-3">{session.summary}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <CalendarCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-400">
                        {formatDate(session.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">
                        {formatTime(session.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Play className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-400">
                        {formatDuration(session.duration_minutes)}
                      </span>
                    </div>

                    {session.players_present && session.players_present.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-orange-400">
                          {session.players_present.length} jogadores
                        </span>
                      </div>
                    )}
                  </div>

                  {session.is_completed && (
                    <div className="flex items-center space-x-6 text-sm">
                      {session.experience_awarded > 0 && (
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400">
                            {session.experience_awarded} XP
                          </span>
                        </div>
                      )}
                      
                      {session.encounters_completed && session.encounters_completed.length > 0 && (
                        <span className="text-gray-400">
                          {session.encounters_completed.length} encontros
                        </span>
                      )}
                      
                      {session.loot_found && session.loot_found.length > 0 && (
                        <span className="text-gray-400">
                          {session.loot_found.length} itens
                        </span>
                      )}
                    </div>
                  )}

                  {session.next_session_preview && (
                    <div className="mt-3 p-3 bg-gray-600/30 rounded-lg">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Próxima Sessão:</span>
                      <p className="text-sm text-gray-300 mt-1">{session.next_session_preview}</p>
                    </div>
                  )}
                </div>

                {isGM && (
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    {!session.is_completed && (
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        }) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {filterStatus === 'all' ? 'Nenhuma sessão registrada' : 
               filterStatus === 'completed' ? 'Nenhuma sessão concluída' :
               'Nenhuma sessão agendada'}
            </h3>
            <p className="text-gray-400">
              {filterStatus === 'all' 
                ? 'Crie registros de suas sessões para acompanhar o progresso da campanha'
                : 'Ajuste os filtros para ver outras sessões'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};