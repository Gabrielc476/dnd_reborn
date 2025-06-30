// ===========================
// CAMPAIGN NOTES - SISTEMA DE NOTAS COM DADOS REAIS
// src/components/campaign-manage/CampaignNotes.tsx
// ===========================

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Globe,
  Search,
  Filter,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';

interface CampaignNote {
  id: string;
  title: string;
  content: string;
  visibility: 'gm_only' | 'players' | 'public';
  tags: string[];
  created_date: string;
  updated_date: string;
  created_by: string;
  session_number?: number;
}

export const CampaignNotes: React.FC = () => {
  const { campaign, updateCampaign, isGM, canPerformAction } = useManageCampaignContext();
  
  const [notes, setNotes] = useState<CampaignNote[]>([]);
  const [editingNote, setEditingNote] = useState<CampaignNote | null>(null);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');

  // ===========================
  // CARREGAR NOTAS REAIS
  // ===========================
  useEffect(() => {
    loadNotes();
  }, [campaign?.id]);

  const loadNotes = async () => {
    if (!campaign?.id) return;
    
    try {
      // Em produção, buscar notas da API
      // Por enquanto, simular com dados baseados nas notas do GM da campanha
      const mockNotes: CampaignNote[] = [
        {
          id: '1',
          title: 'Notas da Sessão 1',
          content: campaign?.gm_notes || 'Notas iniciais da campanha...',
          visibility: 'gm_only',
          tags: ['sessão', 'início'],
          created_date: campaign?.created_date || new Date().toISOString(),
          updated_date: campaign?.updated_date || new Date().toISOString(),
          created_by: campaign?.game_master_id || 'gm',
          session_number: 1
        }
      ];
      
      setNotes(mockNotes);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const handleSaveNote = async (note: CampaignNote) => {
    try {
      if (note.id === 'new') {
        // Criar nova nota
        const newNote: CampaignNote = {
          ...note,
          id: `note-${Date.now()}`,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
          created_by: 'current-user'
        };
        
        setNotes(prev => [...prev, newNote]);
        
        // Se é uma nota GM e está atualizando as notas gerais
        if (note.visibility === 'gm_only' && canPerformAction('edit_campaign')) {
          await updateCampaign({ gm_notes: note.content });
        }
      } else {
        // Atualizar nota existente
        setNotes(prev => prev.map(n => 
          n.id === note.id 
            ? { ...note, updated_date: new Date().toISOString() }
            : n
        ));
      }
      
      setEditingNote(null);
      setShowCreateNote(false);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta nota?')) return;
    
    try {
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'gm_only': return <Lock className="w-4 h-4 text-red-400" />;
      case 'players': return <Eye className="w-4 h-4 text-yellow-400" />;
      case 'public': return <Globe className="w-4 h-4 text-green-400" />;
      default: return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterVisibility === 'all' || note.visibility === filterVisibility;
    const canView = note.visibility === 'public' || 
                   (note.visibility === 'players' && canPerformAction('view_campaign')) ||
                   (note.visibility === 'gm_only' && canPerformAction('view_gm_notes'));
    
    return matchesSearch && matchesFilter && canView;
  });

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Notas da Campanha</h3>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full">
            {filteredNotes.length} notas
          </span>
        </div>
        
        <button
          onClick={() => setShowCreateNote(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Nota</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
        
        <select
          value={filterVisibility}
          onChange={(e) => setFilterVisibility(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="all">Todas</option>
          <option value="gm_only">Apenas GM</option>
          <option value="players">Jogadores</option>
          <option value="public">Públicas</option>
        </select>
      </div>

      {/* Lista de Notas */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-white">{note.title}</h4>
                  {getVisibilityIcon(note.visibility)}
                  
                  {note.session_number && (
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full">
                      Sessão {note.session_number}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3">
                  <span>{new Date(note.created_date).toLocaleDateString('pt-BR')}</span>
                  {note.updated_date !== note.created_date && (
                    <span>Editado em {new Date(note.updated_date).toLocaleDateString('pt-BR')}</span>
                  )}
                  {note.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>{note.tags.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-300 text-sm line-clamp-3">
                  {note.content}
                </p>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setEditingNote(note)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                {canPerformAction('edit_campaign') && (
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vazio */}
      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchTerm ? 'Nenhuma nota encontrada' : 'Nenhuma nota criada'}
          </h3>
          <p className="text-gray-400">
            {searchTerm ? 'Tente buscar com outros termos' : 'Crie notas para acompanhar o progresso da campanha'}
          </p>
        </div>
      )}

      {/* Modal de Edição/Criação */}
      {(editingNote || showCreateNote) && (
        <NoteEditModal
          note={editingNote || {
            id: 'new',
            title: '',
            content: '',
            visibility: 'gm_only',
            tags: [],
            created_date: '',
            updated_date: '',
            created_by: ''
          }}
          onSave={handleSaveNote}
          onCancel={() => {
            setEditingNote(null);
            setShowCreateNote(false);
          }}
          canEditVisibility={canPerformAction('edit_campaign')}
        />
      )}
    </div>
  );
};

// ===========================
// MODAL DE EDIÇÃO DE NOTAS
// ===========================

interface NoteEditModalProps {
  note: CampaignNote;
  onSave: (note: CampaignNote) => void;
  onCancel: () => void;
  canEditVisibility: boolean;
}

const NoteEditModal: React.FC<NoteEditModalProps> = ({ 
  note, 
  onSave, 
  onCancel, 
  canEditVisibility 
}) => {
  const [editedNote, setEditedNote] = useState<CampaignNote>(note);

  const handleSave = () => {
    if (!editedNote.title.trim() || !editedNote.content.trim()) {
      alert('Título e conteúdo são obrigatórios');
      return;
    }
    
    onSave(editedNote);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {note.id === 'new' ? 'Nova Nota' : 'Editar Nota'}
            </h3>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulário */}
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                value={editedNote.title}
                onChange={(e) => setEditedNote(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Título da nota..."
              />
            </div>

            {/* Configurações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visibilidade */}
              {canEditVisibility && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Visibilidade
                  </label>
                  <select
                    value={editedNote.visibility}
                    onChange={(e) => setEditedNote(prev => ({ 
                      ...prev, 
                      visibility: e.target.value as 'gm_only' | 'players' | 'public'
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="gm_only">Apenas GM</option>
                    <option value="players">Jogadores</option>
                    <option value="public">Público</option>
                  </select>
                </div>
              )}

              {/* Número da Sessão */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número da Sessão (opcional)
                </label>
                <input
                  type="number"
                  value={editedNote.session_number || ''}
                  onChange={(e) => setEditedNote(prev => ({ 
                    ...prev, 
                    session_number: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={editedNote.tags.join(', ')}
                onChange={(e) => setEditedNote(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="sessão, combate, npc..."
              />
            </div>

            {/* Conteúdo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Conteúdo
              </label>
              <textarea
                value={editedNote.content}
                onChange={(e) => setEditedNote(prev => ({ ...prev, content: e.target.value }))}
                rows={12}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-y"
                placeholder="Escreva suas notas aqui..."
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};