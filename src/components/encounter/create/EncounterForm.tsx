"use client"

import { useState, useEffect, useMemo } from 'react';
import { DifficultyLevel } from '@/types/createCampaign';
import { CreateEncounterRequest } from '@/types/encounter';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEnhancedNPCs } from '@/hooks/useEnhancedNPCs';
import { Badge } from '@/components/ui/badge';
import { X, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';

interface EncounterFormProps {
  onSubmit: (data: CreateEncounterRequest) => void;
  isSubmitting: boolean;
  campaignId: string;
  initialData?: Partial<CreateEncounterRequest>;
}

export default function EncounterForm({
  onSubmit,
  isSubmitting,
  campaignId,
  initialData = {},
}: EncounterFormProps) {
  // Estado do formulário
  const [formData, setFormData] = useState<CreateEncounterRequest>({
    name: initialData.name || '',
    description: initialData.description || '',
    difficulty: initialData.difficulty || DifficultyLevel.MEDIUM,
    npcs: initialData.npcs || [],
    location: initialData.location || '',
    rewards_xp: initialData.rewards_xp || 0,
    session_number: initialData.session_number || undefined,
    notes: initialData.notes || '',
  });

  // Hook para carregar NPCs
  const {
    npcs: availableNPCs,
    isLoading: isLoadingNPCs,
    searchNPCs,
    setSelectedNPC
  } = useEnhancedNPCs({
    campaignId,
    autoLoad: true,
  });

  // Log do campaignId quando o componente é montado
  useEffect(() => {
    console.log("Campaign ID:", campaignId);
  }, []);

  // Log do estado do useEnhancedNPCs
  useEffect(() => {
    console.log("Estado do useEnhancedNPCs:", {
      isLoading: isLoadingNPCs,
      npcsCount: availableNPCs.length,
      npcs: availableNPCs.map(npc => ({ id: npc.id, name: npc.name })),
    });
  }, [availableNPCs, isLoadingNPCs]);

  const [npcSearch, setNpcSearch] = useState('');
  const [showNPCList, setShowNPCList] = useState(false);
  const [npcFilters, setNpcFilters] = useState({
    name: '',
    type: 'all',
    minCR: 0,
    maxCR: 30,
    aliveOnly: true,
  });

  // Atualizar busca quando o texto muda
  useEffect(() => {
    searchNPCs(npcSearch);
  }, [npcSearch, searchNPCs]);

  // NPCs filtrados para a lista completa
  const filteredNPCs = useMemo(() => {
    return availableNPCs.filter(npc => {
      // Filtro por nome
      if (npcFilters.name && !npc.name?.toLowerCase().includes(npcFilters.name.toLowerCase())) {
        return false;
      }
      
      // Filtro por tipo
      if (npcFilters.type !== 'all' && npc.npc_type !== npcFilters.type) {
        return false;
      }
      
      // Converter CR para número e tratar valores ausentes
      const cr = npc.challenge_rating ? Number(npc.challenge_rating) : 0;
      
      // Filtro por CR
      if (cr < npcFilters.minCR || cr > npcFilters.maxCR) {
        return false;
      }
      
      // Filtro por status de vida
      if (npcFilters.aliveOnly && !npc.is_alive) {
        return false;
      }
      
      return true;
    });
  }, [availableNPCs, npcFilters]);

  // Manipuladores de eventos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rewards_xp' || name === 'session_number' 
        ? Number(value) 
        : value,
    }));
  };

  const handleDifficultyChange = (value: DifficultyLevel) => {
    setFormData(prev => ({ ...prev, difficulty: value }));
  };

  const handleNPCSelect = (npcId: string) => {
    const currentNPCs = formData.npcs || [];
    
    if (!currentNPCs.includes(npcId)) {
      setFormData(prev => ({
        ...prev,
        npcs: [...currentNPCs, npcId],
      }));
      
      // Definir NPC como selecionado
      const npc = availableNPCs.find(n => n.id === npcId);
      if (npc) setSelectedNPC(npc);
    }
    setNpcSearch('');
  };

  const removeNPC = (npcId: string) => {
    const currentNPCs = formData.npcs || [];
    setFormData(prev => ({
      ...prev,
      npcs: currentNPCs.filter(id => id !== npcId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Renderização de NPCs selecionados
  const renderSelectedNPCs = () => (
    <div className="flex flex-wrap gap-2 mb-3">
      {(formData.npcs || []).map(npcId => {
        const npc = availableNPCs.find(n => n.id === npcId);
        return npc ? (
          <Badge 
            key={npcId} 
            className="flex items-center gap-1 py-1 pl-2 pr-1"
            variant="secondary"
          >
            <div className="flex items-center gap-1">
              {npc.avatar_url && (
                <Image 
                  src={npc.avatar_url} 
                  alt={npc.name || 'NPC'}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span className="max-w-[120px] truncate">{npc.name}</span>
            </div>
            <button
              type="button"
              onClick={() => removeNPC(npcId)}
              className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
            >
              <X size={14} />
            </button>
          </Badge>
        ) : null;
      })}
    </div>
  );

  // Renderização da lista completa de NPCs
  const renderNPCList = () => {
    // Calcular CR médio
    const totalCR = availableNPCs.reduce((sum, npc) => {
      const cr = npc.challenge_rating ? Number(npc.challenge_rating) : 0;
      return sum + cr;
    }, 0);
    
    const averageCR = availableNPCs.length > 0 
      ? (totalCR / availableNPCs.length).toFixed(1)
      : '0.0';
    
    return (
      <div className="mt-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter size={18} /> NPCs Disponíveis
          </h3>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowNPCList(!showNPCList)}
              type="button"
            >
              {showNPCList ? 'Ocultar' : 'Expandir'}
            </Button>
          </div>
        </div>

        {/* Filtros de NPC */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <Label htmlFor="npcNameFilter">Nome</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="npcNameFilter"
                value={npcFilters.name}
                onChange={(e) => setNpcFilters({...npcFilters, name: e.target.value})}
                placeholder="Buscar NPC..."
                className="pl-9"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="npcTypeFilter">Tipo</Label>
            <Select
              value={npcFilters.type}
              onValueChange={(value) => setNpcFilters({...npcFilters, type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="HUMANOIDE">Humanoide</SelectItem>
                <SelectItem value="BESTA">Besta</SelectItem>
                <SelectItem value="MONSTRO">Monstro</SelectItem>
                <SelectItem value="DRAGAO">Dragão</SelectItem>
                <SelectItem value="CONSTRUCTO">Constructo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Nível de Desafio (CR)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={npcFilters.minCR}
                onChange={(e) => setNpcFilters({...npcFilters, minCR: Number(e.target.value)})}
                min={0}
                max={30}
                placeholder="Min"
              />
              <Input
                type="number"
                value={npcFilters.maxCR}
                onChange={(e) => setNpcFilters({...npcFilters, maxCR: Number(e.target.value)})}
                min={0}
                max={30}
                placeholder="Max"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="aliveOnly"
                checked={npcFilters.aliveOnly}
                onCheckedChange={(checked) => 
                  setNpcFilters({...npcFilters, aliveOnly: checked as boolean})
                }
              />
              <Label htmlFor="aliveOnly">Apenas vivos</Label>
            </div>
          </div>
        </div>

        {/* Lista de NPCs */}
        {showNPCList && (
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-h-[400px] overflow-y-auto">
              {isLoadingNPCs ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredNPCs.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <Search size={24} className="mx-auto mb-2" />
                  Nenhum NPC encontrado com esses filtros
                </div>
              ) : (
                filteredNPCs.map(npc => {
                  // Converter CR para número e tratar valores ausentes
                  const cr = npc.challenge_rating ? Number(npc.challenge_rating) : 0;
                  
                  return (
                    <div
                      key={npc.id}
                      className={`border rounded-lg p-3 transition-all hover:shadow-md ${
                        (formData.npcs || []).includes(npc.id)
                          ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                          : 'bg-white dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {npc.avatar_url && (
                          <div className="flex-shrink-0">
                            <Image 
                              src={npc.avatar_url} 
                              alt={npc.name || 'NPC'}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-600"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>{npc.name}</span>
                            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                              CR {cr}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {npc.race || ''} • {npc.npc_class || ''}
                          </div>
                          <div className="mt-2 flex justify-between">
                            <Badge variant="outline">
                              {npc.npc_type || 'NPC'}
                            </Badge>
                            <Badge variant={npc.is_alive ? 'default' : 'destructive'}>
                              {npc.is_alive ? 'Vivo' : 'Morto'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            (formData.npcs || []).includes(npc.id) 
                              ? 'destructive' 
                              : 'outline'
                          }
                          onClick={() => {
                            if ((formData.npcs || []).includes(npc.id)) {
                              removeNPC(npc.id);
                            } else {
                              handleNPCSelect(npc.id);
                            }
                          }}
                        >
                          {(formData.npcs || []).includes(npc.id) 
                            ? 'Remover' 
                            : 'Adicionar'}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Contador e estatísticas */}
            <div className="border-t px-4 py-2 bg-gray-100 dark:bg-gray-700 flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <div>
                Mostrando {filteredNPCs.length} de {availableNPCs.length} NPCs
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  Vivos: {availableNPCs.filter(n => n.is_alive).length}
                </Badge>
                <Badge variant="secondary">
                  CR Médio: {averageCR}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo: Nome */}
      <div>
        <Label htmlFor="name">Nome do Encontro *</Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      {/* Campo: Descrição */}
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          maxLength={500}
        />
      </div>

      {/* Campo: Dificuldade */}
      <div>
        <Label>Dificuldade *</Label>
        <Select
          value={formData.difficulty}
          onValueChange={handleDifficultyChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione a dificuldade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DifficultyLevel.EASY}>Fácil</SelectItem>
            <SelectItem value={DifficultyLevel.MEDIUM}>Médio</SelectItem>
            <SelectItem value={DifficultyLevel.HARD}>Difícil</SelectItem>
            <SelectItem value={DifficultyLevel.DEADLY}>Mortal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campo: NPCs */}
      <div>
        <Label>NPCs Envolvidos</Label>
        <div className="mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Selecione os NPCs que participarão deste encontro
          </p>
          
          {/* NPCs selecionados */}
          {renderSelectedNPCs()}

          {/* Busca rápida de NPCs */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Adicionar NPC por nome..."
                value={npcSearch}
                onChange={(e) => setNpcSearch(e.target.value)}
                disabled={isLoadingNPCs}
                className="pl-9"
              />
            </div>
            
            {isLoadingNPCs ? (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                <div className="px-4 py-2">
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ) : npcSearch && filteredNPCs.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredNPCs
                  .filter(npc => !(formData.npcs || []).includes(npc.id))
                  .slice(0, 5) // Limitar a 5 resultados
                  .map(npc => {
                    // Converter CR para número e tratar valores ausentes
                    const cr = npc.challenge_rating ? Number(npc.challenge_rating) : 0;
                    
                    return (
                      <div
                        key={npc.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                        onClick={() => handleNPCSelect(npc.id)}
                      >
                        {npc.avatar_url && (
                          <div className="flex-shrink-0">
                            <Image 
                              src={npc.avatar_url} 
                              alt={npc.name || 'NPC'}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{npc.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {npc.race || ''} • {npc.npc_class || ''} • CR: {cr}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
        
        {/* Lista completa de NPCs */}
        {renderNPCList()}
      </div>

      {/* Campo: Localização */}
      <div>
        <Label htmlFor="location">Localização</Label>
        <Input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          maxLength={200}
        />
      </div>

      {/* Campo: XP de Recompensa */}
      <div>
        <Label htmlFor="rewards_xp">XP de Recompensa</Label>
        <Input
          id="rewards_xp"
          name="rewards_xp"
          type="number"
          value={formData.rewards_xp}
          onChange={handleChange}
          min={0}
        />
      </div>

      {/* Campo: Número da Sessão */}
      <div>
        <Label htmlFor="session_number">Número da Sessão</Label>
        <Input
          id="session_number"
          name="session_number"
          type="number"
          value={formData.session_number || ''}
          onChange={handleChange}
          min={1}
        />
      </div>

      {/* Campo: Notas */}
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          maxLength={1000}
        />
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Criando...' : 'Criar Encontro'}
        </Button>
      </div>
    </form>
  );
}