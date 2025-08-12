import React, { useState, useEffect } from 'react';
import { EquipmentItem, Character } from "@/types/character";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Package, 
  Shield, 
  Sword, 
  ArrowRight, 
  Coins, 
  Weight, 
  ScrollText,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface InventoryPanelProps {
  character: Character;
}

interface EquipmentWithDetails extends EquipmentItem {
  quantity: number;
  details?: any;
  loading?: boolean;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ character }) => {
  const [inventory, setInventory] = useState<EquipmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    console.log(character)
  },[])
  // Agrupa itens iguais e busca detalhes na API
  useEffect(() => {
    if (!character || !character.equipment) {
      setLoading(false);
      return;
    }

    const fetchEquipmentDetails = async () => {
      try {
        setLoading(true);
        
        // Agrupa itens pelo index e conta as quantidades
        const groupedItems: Record<string, EquipmentWithDetails> = {};
        
        character.equipment.forEach(item => {
          if (!item.index) return;
          
          if (groupedItems[item.index]) {
            groupedItems[item.index].quantity += 1;
          } else {
            groupedItems[item.index] = {
              ...item,
              quantity: 1,
              loading: true
            };
          }
        });

        // Converte para array
        const itemsArray = Object.values(groupedItems);
        setInventory(itemsArray);
        
        // Busca detalhes para cada item único
        const updatedInventory = await Promise.all(
          itemsArray.map(async item => {
            try {
              const response = await fetch(`https://www.dnd5eapi.co/api/equipment/${item.index}`);
              if (!response.ok) throw new Error('Item not found');
              
              const details = await response.json();
              return {
                ...item,
                details,
                loading: false
              };
            } catch (error) {
              console.error(`Failed to fetch details for ${item.index}:`, error);
              return {
                ...item,
                loading: false,
                details: null
              };
            }
          })
        );

        setInventory(updatedInventory);
        
        // Calcula peso e valor totais
        let weightTotal = 0;
        let valueTotal = 0;
        
        updatedInventory.forEach(item => {
          if (item.details?.weight) {
            weightTotal += item.details.weight * item.quantity;
          }
          if (item.details?.cost?.quantity) {
            valueTotal += item.details.cost.quantity * item.quantity;
          }
        });
        
        setTotalWeight(weightTotal);
        setTotalValue(valueTotal);
        
      } catch (error) {
        console.error("Failed to load inventory:", error);
        toast.error("Erro de Carregamento", {
          description: "Não foi possível carregar os detalhes do inventário"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentDetails();
    
  }, [character]);

  const handleAdjustQuantity = (index: string, amount: number) => {
    setInventory(prev => 
      prev.map(item => 
        item.index === index 
          ? { ...item, quantity: Math.max(1, item.quantity + amount) } 
          : item
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'armor': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'weapon': return <Sword className="w-5 h-5 text-red-400" />;
      default: return <Package className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatCurrency = (quantity: number, unit: string) => {
    const units: Record<string, string> = {
      'cp': 'cobre',
      'sp': 'prata',
      'ep': 'electro',
      'gp': 'ouro',
      'pp': 'platina'
    };
    
    return `${quantity} ${units[unit] || unit}`;
  };

  const renderItemDetails = (item: EquipmentWithDetails) => {
    if (item.loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    }
    
    if (!item.details) {
      return <p className="text-gray-400">Detalhes não disponíveis</p>;
    }
    
    return (
      <div className="space-y-2">
        {item.details.desc && item.details.desc.length > 0 && (
          <p className="text-sm text-gray-300">
            {item.details.desc[0]}
          </p>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm">
          {item.details.cost && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Coins className="w-4 h-4" />
              <span>{formatCurrency(item.details.cost.quantity, item.details.cost.unit)}</span>
            </div>
          )}
          
          {item.details.weight && (
            <div className="flex items-center gap-1 text-gray-400">
              <Weight className="w-4 h-4" />
              <span>{item.details.weight} lbs</span>
            </div>
          )}
          
          {item.details.damage && (
            <div className="flex items-center gap-1 text-red-400">
              <Sword className="w-4 h-4" />
              <span>{item.details.damage.damage_dice} de dano</span>
            </div>
          )}
          
          {item.details.armor_class && (
            <div className="flex items-center gap-1 text-blue-400">
              <Shield className="w-4 h-4" />
              <span>CA: {item.details.armor_class.base}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!character) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Personagem Não Carregado</h3>
        <p className="text-gray-400">
          Não foi possível carregar o inventário do personagem
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Package className="w-8 h-8 text-yellow-400" />
          Inventário de {character.basic_info?.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Weight className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Peso Total</p>
                <p className="text-xl font-bold text-white">
                  {totalWeight.toFixed(1)} lbs
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Valor Total</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalValue, 'gp')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="bg-gray-800/30 border border-gray-700/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : inventory.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Inventário Vazio</h3>
              <p className="text-gray-400">
                Seu personagem não possui itens no inventário
              </p>
            </div>
          ) : (
            inventory.map((item, index) => (
              <Card 
                key={`${item.index}-${index}`} 
                className="bg-gray-800/30 border border-gray-700/50 hover:border-yellow-500/30 transition-colors"
              >
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(item.equipment_category?.index || '')}
                      <CardTitle className="text-lg font-semibold text-white">
                        {item.name}
                        {item.quantity > 1 && (
                          <span className="ml-2 text-sm text-gray-400">
                            x{item.quantity}
                          </span>
                        )}
                      </CardTitle>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="w-8 h-8"
                        onClick={() => handleAdjustQuantity(item.index, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-300 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="w-8 h-8"
                        onClick={() => handleAdjustQuantity(item.index, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-3 pb-4">
                  {renderItemDetails(item)}
                </CardContent>
                
                {item.details?.properties && item.details.properties.length > 0 && (
                  <CardFooter className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {item.details.properties.map((prop: any, i: number) => (
                        <span 
                          key={i} 
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                        >
                          {prop.name}
                        </span>
                      ))}
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;