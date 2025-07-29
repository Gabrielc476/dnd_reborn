import React, { useState } from 'react';
import { 
  X,
  Mail,
  User,
  UserPlus,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaing';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ isOpen, onClose }) => {
  const { addPlayer, campaign } = useManageCampaignContext();
  
  const [method, setMethod] = useState<'invite' | 'search'>('invite');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInviteByEmail = async () => {
    if (!email.includes('@')) {
      setError('Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await addPlayer({
        email,
        role: 'player',
        campaign_id: campaign?.id || ''
      });

      if (result) {
        setSuccess(`Convite enviado para ${email}`);
        setEmail('');
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      } else {
        setError('Erro ao enviar convite. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao enviar convite. Verifique se o email está correto.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!username.trim()) {
      setError('Digite um nome de usuário para buscar');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Simular busca de usuários - em produção seria uma chamada à API
      setTimeout(() => {
        const mockResults = [
          { id: 1, username: username, email: `${username}@example.com`, avatar: null },
          { id: 2, username: `${username}123`, email: `${username}123@example.com`, avatar: null },
        ];
        setSearchResults(mockResults);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Erro ao buscar usuários. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleAddFromSearch = async (user: any) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await addPlayer({
        user_id: user.id,
        role: 'player',
        campaign_id: campaign?.id || ''
      });

      if (result) {
        setSuccess(`${user.username} foi adicionado à campanha`);
        setTimeout(() => {
          onClose();
          setSuccess('');
          setSearchResults([]);
        }, 2000);
      } else {
        setError('Erro ao adicionar jogador. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao adicionar jogador.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setSearchResults([]);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserPlus className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Adicionar Jogador</h2>
          </div>
          
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Method Selection */}
        <div className="mb-6">
          <div className="flex rounded-lg bg-gray-700 p-1">
            <button
              onClick={() => setMethod('invite')}
              className={`flex-1 py-2 px-4 rounded transition-colors ${
                method === 'invite' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Convidar por Email</span>
              </div>
            </button>
            
            <button
              onClick={() => setMethod('search')}
              className={`flex-1 py-2 px-4 rounded transition-colors ${
                method === 'search' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Buscar Usuário</span>
              </div>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-300">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Invite by Email */}
        {method === 'invite' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email do Jogador
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jogador@exemplo.com"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
            
            <button
              onClick={handleInviteByEmail}
              disabled={isLoading || !email}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors text-white font-medium"
            >
              {isLoading ? 'Enviando Convite...' : 'Enviar Convite'}
            </button>
          </div>
        )}

        {/* Search User */}
        {method === 'search' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome de Usuário
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nome_do_usuario"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
                />
                <button
                  onClick={handleSearchUser}
                  disabled={isLoading || !username}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Resultados da Busca:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="w-6 h-6 text-gray-400" />
                        <div>
                          <div className="font-medium text-white">{user.username}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleAddFromSearch(user)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && method === 'search' && (
              <div className="text-center text-gray-400">
                Buscando usuários...
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-3 bg-blue-900 border border-blue-700 rounded">
          <p className="text-sm text-blue-300">
            <strong>Dica:</strong> Jogadores convidados receberão um email com um link para 
            se juntar à sua campanha. Eles precisarão criar uma conta se ainda não tiverem uma.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddPlayerModal;