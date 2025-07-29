import React, { useEffect, useState } from 'react';
import { 
  Home,
  Users,
  Calendar,
  User,
  Package,
  Heart,
  Dice5,
  Sparkles,
  ChevronDown,
  Shield,
  Target,
  Zap,
  RefreshCw,
  Activity,       // Para Atributos
  SpellIcon,      // Para Magias - substitua por ícone adequado
  ScrollText,     // Para Perícias
  Backpack,       // Para Inventário
  Sword,          // Para Ataques
  Star            // Para Habilidades
} from 'lucide-react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthContext } from '@/hooks/useAuth';
import { characterAPI, Character } from '@/api/characterAPI';

export type PlayerSection = 
  | 'overview' 
  | 'character'
  | 'party' 
  | 'sessions' 
  | 'loot'
  | 'notes'
  | 'attributes'   // Nova seção
  | 'spells'       // Nova seção
  | 'skills'       // Nova seção
  | 'inventory'    // Nova seção
  | 'abilities'    // Nova seção
  | 'attacks';     // Nova seção

interface PlayerSidebarProps {
  onNavigate: (section: PlayerSection) => void;
  currentSection: PlayerSection;
}

interface SidebarItem {
  label: string;
  action: () => void;
  icon: React.ComponentType;
  highlight?: boolean;
  badge?: number;
  disabled?: boolean;
}

const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ 
  onNavigate, 
  currentSection 
}) => {
  const {
    campaign,
    dashboard,
    canPerformAction,
  } = useManageCampaignContext();

  const {user} = useAuthContext();

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isRolling, setIsRolling] = useState(false);
  const [character, setCharacter] = useState<Character | undefined>(undefined);

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!user?.id || !campaign?.id) return;
      
      try {
        const response = await characterAPI.getCampaignCharacters(campaign.id);
        
        if (response.success && response.characters) {
          const userCharacter = response.characters.find(
            char => char.user_id === user.id
          );
          setCharacter(userCharacter);
        }
      } catch (error) {
        console.error("Failed to fetch character:", error);
      }
    };

    fetchCharacter();
  }, [user?.id, campaign?.id]);

  const handleQuickDiceRoll = async (diceType: string) => {
    if (!canPerformAction('roll_dice')) return;
    
    setIsRolling(true);
    try {
      console.log(`🎲 Rolou ${diceType}`);
    } catch (error) {
      console.error('Erro ao rolar dados:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const handleShortRest = async () => {
    if (!canPerformAction('rest')) return;
    
    try {
      console.log('🛌 Descanso curto realizado');
    } catch (error) {
      console.error('Erro ao descansar:', error);
    }
  };

  const sidebarSections: {
    id: string;
    title: string;
    icon: React.ComponentType;
    items: SidebarItem[];
  }[] = [
    {
      id: 'navigation',
      title: 'NAVEGAÇÃO',
      icon: Home,
      items: [
        { 
          label: 'Visão Geral', 
          action: () => onNavigate('overview'),
          icon: Home,
          highlight: currentSection === 'overview'
        },
        { 
          label: 'Meu Personagem', 
          action: () => onNavigate('character'),
          icon: User,
          highlight: currentSection === 'character'
        },
        { 
          label: 'Grupo', 
          action: () => onNavigate('party'),
          icon: Users,
          highlight: currentSection === 'party',
          badge: campaign?.players?.length || 0
        },
        { 
          label: 'Sessões', 
          action: () => onNavigate('sessions'),
          icon: Calendar,
          highlight: currentSection === 'sessions',
          badge: 0
        },
        { 
          label: 'Tesouro', 
          action: () => onNavigate('loot'),
          icon: Package,
          highlight: currentSection === 'loot'
        },
      ]
    },
    {
      id: 'character',
      title: 'PERSONAGEM',
      icon: User,
      items: [
        { 
          label: 'Atributos', 
          action: () => onNavigate('attributes'),
          icon: Activity,
          highlight: currentSection === 'attributes'
        },
        { 
          label: 'Magias', 
          action: () => onNavigate('spells'),
          icon: Sparkles, // Use SpellIcon se tiver um ícone específico
          highlight: currentSection === 'spells'
        },
        { 
          label: 'Perícias', 
          action: () => onNavigate('skills'),
          icon: ScrollText,
          highlight: currentSection === 'skills'
        },
        { 
          label: 'Inventário', 
          action: () => onNavigate('inventory'),
          icon: Backpack,
          highlight: currentSection === 'inventory'
        },
        { 
          label: 'Habilidades', 
          action: () => onNavigate('abilities'),
          icon: Star,
          highlight: currentSection === 'abilities'
        },
        { 
          label: 'Ataques', 
          action: () => onNavigate('attacks'),
          icon: Sword,
          highlight: currentSection === 'attacks'
        }
      ]
    },
    {
      id: 'actions',
      title: 'AÇÕES RÁPIDAS',
      icon: Zap,
      items: [
        {
          label: 'Descanso Curto',
          action: handleShortRest,
          icon: Heart
        },
        {
          label: 'Usar Habilidade',
          action: () => console.log('Abrir habilidades'),
          icon: Sparkles
        },
        {
          label: 'Preparar Ação',
          action: () => console.log('Preparar ação'),
          icon: Target
        }
      ]
    },
    {
      id: 'dice',
      title: 'ROLAGENS',
      icon: Dice5,
      items: []
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-800 border-r border-gray-700">
      <Card className="rounded-none border-0 border-b border-gray-700 bg-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-100">
                {campaign?.name || (
                  <Skeleton className="h-6 w-32 bg-gray-700" />
                )}
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                {character?.name || 'Seu Personagem'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {/* Espaço para informações rápidas do personagem */}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 overflow-y-auto">
        {sidebarSections.map((section) => (
          <Card 
            key={section.id} 
            className="rounded-none border-0 border-b border-gray-700 bg-gray-800"
          >
            <CardHeader 
              className="py-3 cursor-pointer hover:bg-gray-700/50" 
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <section.icon className="w-5 h-5 text-blue-300" />
                  <CardTitle className="text-sm font-semibold text-gray-100">
                    {section.title}
                  </CardTitle>
                </div>
                <span className={`transition-transform ${
                  collapsedSections.has(section.id) ? 'transform rotate-180' : ''
                }`}>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </span>
              </div>
            </CardHeader>
            
            {!collapsedSections.has(section.id) && (
              <CardContent className="pt-0 pb-4">
                {section.id === 'dice' && (
                  <div className="grid grid-cols-3 gap-2">
                    {['d20', 'd12', 'd10', 'd8', 'd6', 'd4'].map(die => (
                      <Tooltip key={die}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={isRolling}
                            onClick={() => handleQuickDiceRoll(die)}
                            className="relative border-gray-600 text-gray-200 hover:bg-gray-700"
                          >
                            {isRolling ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Dice5 className="h-4 w-4" />
                                <span className="absolute bottom-1 right-1 text-[8px] text-gray-300">
                                  {die.substring(1)}
                                </span>
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-800 text-gray-100 border border-gray-700">
                          <p>Rolar {die}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}

                {section.items.length > 0 && section.id !== 'dice' && (
                  <div className="space-y-2">
                    {section.items.map((item, index) => (
                      <Button
                        key={index}
                        variant={item.highlight ? 'secondary' : 'ghost'}
                        className={`w-full justify-start ${
                          item.highlight 
                            ? 'bg-blue-400/20 hover:bg-blue-400/30 text-blue-300 border border-blue-400/30' 
                            : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                        }`}
                        onClick={item.action}
                        disabled={item.disabled}
                      >
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        {item.label}
                        {item.badge !== undefined && (
                          <Badge className="ml-auto bg-gray-700 text-gray-300">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <CardFooter className="py-3 text-center text-xs text-gray-500 bg-gray-800 border-t border-gray-700">
        <p>Sessão ativa: {dashboard?.current_session_name || 'Nenhuma'}</p>
        <p>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</p>
      </CardFooter>
    </div>
  );
};

export default PlayerSidebar;