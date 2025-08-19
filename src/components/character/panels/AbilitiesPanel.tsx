import { useState, useEffect } from "react";
import { Character } from "@/types/character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Sparkles, Zap } from "lucide-react";

const AbilitesPanel = ({ character }: { character: Character }) => {
    const [activeLevels, setActiveLevels] = useState<number[]>([]);
    
    // Abre automaticamente os níveis que o personagem já alcançou
    useEffect(() => {
        if (!character?.chosen_subclass?.subclass_levels) return;
        
        const unlockedLevels = character.chosen_subclass.subclass_levels
            .filter(level => level.level <= (character.basic_info?.level || 1))
            .map(level => level.level);
        
        setActiveLevels(unlockedLevels);
    }, [character]);

    const toggleLevel = (level: number) => {
        setActiveLevels(prev => 
            prev.includes(level) 
                ? prev.filter(l => l !== level) 
                : [...prev, level]
        );
    };

    if (!character?.chosen_subclass) {
        return (
            <div className="text-center py-12">
                <div className="mb-4">
                    <Sparkles className="w-12 h-12 mx-auto text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhuma Subclasse Selecionada
                </h3>
                <p className="text-gray-400">
                    Este personagem não possui uma subclasse definida
                </p>
            </div>
        );
    }

    const subclass = character.chosen_subclass;
    const currentLevel = character.basic_info?.level || 1;

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-purple-500/20 p-3 rounded-xl">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {subclass.name}
                        </h2>
                        <p className="text-gray-400">
                            {subclass.class?.name || "Classe desconhecida"}
                        </p>
                    </div>
                </div>
                
                <div className="prose prose-invert max-w-none text-gray-300">
                    {subclass.desc?.map((paragraph, index) => (
                        <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                    
                    {subclass.subclass_flavor && (
                        <blockquote className="border-l-4 border-purple-500 pl-4 italic my-6">
                            {subclass.subclass_flavor}
                        </blockquote>
                    )}
                </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <h3 className="text-lg font-semibold text-white p-6 pb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Habilidades por Nível
                </h3>
                
                <div className="divide-y divide-gray-700/50">
                    {subclass.subclass_levels?.map(levelInfo => {
                        const isUnlocked = levelInfo.level <= currentLevel;
                        const isExpanded = activeLevels.includes(levelInfo.level);
                        
                        return (
                            <Collapsible 
                                key={levelInfo.level}
                                open={isExpanded}
                                onOpenChange={() => toggleLevel(levelInfo.level)}
                            >
                                <CollapsibleTrigger 
                                    className={`w-full p-4 text-left hover:bg-gray-700/30 transition-colors ${
                                        isUnlocked ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                    }`}
                                    disabled={!isUnlocked}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                isUnlocked 
                                                    ? "bg-green-500/20 text-green-400" 
                                                    : "bg-gray-700 text-gray-500"
                                            }`}>
                                                {levelInfo.level}
                                            </div>
                                            <h4 className="font-medium">
                                                Nível {levelInfo.level} {!isUnlocked && "(não alcançado)"}
                                            </h4>
                                        </div>
                                        {isUnlocked && (
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${
                                                isExpanded ? "rotate-0" : "rotate-[-90deg]"
                                            }`} />
                                        )}
                                    </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent className="p-4 pt-0 bg-gray-800/30">
                                    <div className="space-y-4">
                                        {levelInfo.features.map((feature, idx) => (
                                            <Card 
                                                key={`${levelInfo.level}-${idx}`}
                                                className="bg-gray-800/50 border border-gray-700/50"
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-white flex items-center gap-2">
                                                        {feature.name}
                                                        {isUnlocked && (
                                                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                                                Disponível
                                                            </span>
                                                        )}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-gray-300">
                                                        {feature.description}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center p-4">
                <p>Subclasse ID: {subclass.index}</p>
                <p>Personagem nível {currentLevel}</p>
            </div>
        </div>
    );
};

export default AbilitesPanel;