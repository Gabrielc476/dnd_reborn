// src/components/character-creation/ui/SearchableList.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface SearchableListProps<T> {
  // Props existentes (para compatibilidade com uso simples)
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;

  // Props novas (para uso avançado com lista de itens)
  items?: T[];
  searchTerm?: string;
  selectedItem?: T | null;
  onItemSelect?: (item: T) => void;
  renderItem?: (item: T) => ReactNode;
  emptyMessage?: string;
  keyExtractor?: (item: T) => string;
}

export default function SearchableList<T = any>({
  // Props simples
  searchValue,
  onSearchChange,
  placeholder = "Buscar...",
  loading = false,
  className = "",

  // Props avançadas
  items = [],
  searchTerm,
  selectedItem,
  onItemSelect,
  renderItem,
  emptyMessage = "Nenhum item encontrado",
  keyExtractor,
}: SearchableListProps<T>) {
  // Se tem items, usa o modo avançado
  const isAdvancedMode = items.length > 0 || renderItem;
  
  // Para modo avançado, usa searchTerm, senão usa searchValue
  const currentSearchValue = isAdvancedMode ? searchTerm : searchValue;
  const handleSearchChange = isAdvancedMode ? onSearchChange : onSearchChange;

  // Filtra items se estiver no modo avançado
  const filteredItems = isAdvancedMode && currentSearchValue 
    ? items.filter((item: any) => {
        // Tenta filtrar por propriedades comuns
        const searchText = currentSearchValue.toLowerCase();
        return (
          item.name?.toLowerCase().includes(searchText) ||
          item.title?.toLowerCase().includes(searchText) ||
          item.index?.toLowerCase().includes(searchText) ||
          JSON.stringify(item).toLowerCase().includes(searchText)
        );
      })
    : items;

  return (
    <div className={`space-y-4 h-full flex flex-col ${className}`}>
      {/* Campo de busca */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 text-purple-300 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-purple-300" />
          )}
        </div>
        <Input
          type="text"
          value={currentSearchValue || ""}
          onChange={(e) => handleSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder-purple-300/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Lista de itens (só no modo avançado) */}
      {isAdvancedMode && (
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-purple-300 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-purple-200 text-sm">Carregando...</p>
              </div>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-2 h-full overflow-y-auto pr-2">
              {filteredItems.map((item, index) => {
                const key = keyExtractor 
                  ? keyExtractor(item) 
                  : (item as any).index || (item as any).id || index;
                
                return (
                  <div key={key}>
                    {renderItem ? renderItem(item) : (
                      <div 
                        className="p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => onItemSelect?.(item)}
                      >
                        <p className="text-white">
                          {(item as any).name || (item as any).title || "Item"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-purple-200 text-sm">{emptyMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}