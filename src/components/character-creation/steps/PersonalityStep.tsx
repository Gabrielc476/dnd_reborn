"use client";

import { useState } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  Star,
  Link,
  AlertTriangle,
  Plus,
  X,
  Dices,
  Info,
  User,
} from "lucide-react";
import { ALIGNMENTS } from "@/types/characterCreation";

const SAMPLE_TRAITS = [
  "Sou sempre educado e respeitoso",
  "Não consigo resistir a um rosto bonito",
  "Tenho um senso de humor peculiar",
  "Sou extremamente corajoso",
  "Falo sem pensar nas consequências",
  "Coleciono histórias, rumores e lendas",
  "Tenho dificuldade para confiar nas pessoas",
  "Sempre ajudo aqueles em necessidade",
];

const SAMPLE_IDEALS = [
  "Tradição: As tradições antigas devem ser preservadas",
  "Caridade: Sempre ajudo aqueles em necessidade",
  "Mudança: A vida é como as estações, em constante mudança",
  "Poder: Se posso me tornar mais poderoso, por que não deveria?",
  "Fé: Confio que minha divindade me guiará",
  "Aspiração: Devo me provar digno dos meus ancestrais",
  "Independência: Sou um espírito livre, ninguém me diz o que fazer",
  "Justiça: Nunca deixo um crime passar impune",
];

const SAMPLE_BONDS = [
  "Minha família, clã ou tribo é a coisa mais importante da minha vida",
  "Uma obra de arte criada por alguém especial para mim",
  "Devo minha vida à pessoa que me acolheu quando era órfão",
  "Meu honor é minha vida",
  "A oficina onde aprendi meu ofício é sagrada para mim",
  "Busco vingança contra o mal que arruinou minha terra natal",
  "Tenho uma dívida que não posso quitar",
  "Alguém que amo desapareceu. Devo encontrá-lo",
];

const SAMPLE_FLAWS = [
  "Eu julgo outros duramente, e a mim mesmo ainda mais",
  "Coloco muita confiança em quem possui poder",
  "Tenho um vício terrível por comida, bebida ou jogos",
  "Não consigo guardar segredos",
  "Sou muito teimoso em meus caminhos",
  "Uma vez alguém questione minha coragem, nunca recuo",
  "Tenho uma 'dívida' que precisa ser paga",
  "Meu orgulho provavelmente causará minha ruína",
];

export default function PersonalityStep() {
  const { characterData, updateCharacterData } = useCharacterCreationContext();

  const [newTrait, setNewTrait] = useState("");
  const [newIdeal, setNewIdeal] = useState("");
  const [newBond, setNewBond] = useState("");
  const [newFlaw, setNewFlaw] = useState("");

  const addPersonalityTrait = () => {
    if (newTrait.trim() && characterData.personalityTraits.length < 4) {
      updateCharacterData({
        personalityTraits: [
          ...characterData.personalityTraits,
          newTrait.trim(),
        ],
      });
      setNewTrait("");
    }
  };

  const removePersonalityTrait = (index: number) => {
    updateCharacterData({
      personalityTraits: characterData.personalityTraits.filter(
        (_, i) => i !== index
      ),
    });
  };

  const addIdeal = () => {
    if (newIdeal.trim() && characterData.ideals.length < 2) {
      updateCharacterData({
        ideals: [...characterData.ideals, newIdeal.trim()],
      });
      setNewIdeal("");
    }
  };

  const removeIdeal = (index: number) => {
    updateCharacterData({
      ideals: characterData.ideals.filter((_, i) => i !== index),
    });
  };

  const addBond = () => {
    if (newBond.trim() && characterData.bonds.length < 2) {
      updateCharacterData({
        bonds: [...characterData.bonds, newBond.trim()],
      });
      setNewBond("");
    }
  };

  const removeBond = (index: number) => {
    updateCharacterData({
      bonds: characterData.bonds.filter((_, i) => i !== index),
    });
  };

  const addFlaw = () => {
    if (newFlaw.trim() && characterData.flaws.length < 2) {
      updateCharacterData({
        flaws: [...characterData.flaws, newFlaw.trim()],
      });
      setNewFlaw("");
    }
  };

  const removeFlaw = (index: number) => {
    updateCharacterData({
      flaws: characterData.flaws.filter((_, i) => i !== index),
    });
  };

  const getRandomSample = (
    samples: string[],
    current: string[],
    setter: (value: string) => void
  ) => {
    const available = samples.filter((sample) => !current.includes(sample));
    if (available.length > 0) {
      const random = available[Math.floor(Math.random() * available.length)];
      setter(random);
    }
  };

  const handleAlignmentChange = (alignment: string) => {
    updateCharacterData({ alignment });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Personalização</h2>
        <p className="text-purple-200">
          Dê vida ao seu personagem com traços, ideais, vínculos e defeitos
        </p>
      </div>

      {/* Alignment Selection */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-400" />
              <Label className="text-white text-lg font-semibold">
                Tendência
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ALIGNMENTS.map((alignment) => (
                <Button
                  key={alignment.value}
                  variant={
                    characterData.alignment === alignment.value
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleAlignmentChange(alignment.value)}
                  className="h-auto p-4 text-left flex flex-col items-start space-y-2"
                >
                  <span className="font-semibold text-sm">
                    {alignment.label}
                  </span>
                  <p className="text-xs opacity-80 text-left">
                    {alignment.description}
                  </p>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personality Traits */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <Label className="text-white text-lg font-semibold">
                  Traços de Personalidade
                </Label>
              </div>
              <span className="text-purple-200 text-sm">
                {characterData.personalityTraits.length}/4
              </span>
            </div>

            {/* Current Traits */}
            {characterData.personalityTraits.length > 0 && (
              <div className="space-y-2">
                {characterData.personalityTraits.map((trait, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-3"
                  >
                    <span className="text-yellow-200 text-sm">{trait}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePersonalityTrait(index)}
                      className="text-yellow-400 hover:text-yellow-300 h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Trait */}
            {characterData.personalityTraits.length < 4 && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    placeholder="Digite um traço de personalidade..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-purple-300/70"
                    onKeyPress={(e) =>
                      e.key === "Enter" && addPersonalityTrait()
                    }
                  />
                  <Button
                    onClick={addPersonalityTrait}
                    disabled={!newTrait.trim()}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() =>
                      getRandomSample(
                        SAMPLE_TRAITS,
                        characterData.personalityTraits,
                        setNewTrait
                      )
                    }
                    variant="outline"
                    className="bg-white/5 border-white/20"
                  >
                    <Dices className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ideals */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-blue-400" />
                <Label className="text-white text-lg font-semibold">
                  Ideais
                </Label>
              </div>
              <span className="text-purple-200 text-sm">
                {characterData.ideals.length}/2
              </span>
            </div>

            {/* Current Ideals */}
            {characterData.ideals.length > 0 && (
              <div className="space-y-2">
                {characterData.ideals.map((ideal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-500/10 border border-blue-400/20 rounded-lg p-3"
                  >
                    <span className="text-blue-200 text-sm">{ideal}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeIdeal(index)}
                      className="text-blue-400 hover:text-blue-300 h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Ideal */}
            {characterData.ideals.length < 2 && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={newIdeal}
                    onChange={(e) => setNewIdeal(e.target.value)}
                    placeholder="Digite um ideal..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-purple-300/70"
                    onKeyPress={(e) => e.key === "Enter" && addIdeal()}
                  />
                  <Button
                    onClick={addIdeal}
                    disabled={!newIdeal.trim()}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() =>
                      getRandomSample(
                        SAMPLE_IDEALS,
                        characterData.ideals,
                        setNewIdeal
                      )
                    }
                    variant="outline"
                    className="bg-white/5 border-white/20"
                  >
                    <Dices className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bonds */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link className="w-5 h-5 text-green-400" />
                <Label className="text-white text-lg font-semibold">
                  Vínculos
                </Label>
              </div>
              <span className="text-purple-200 text-sm">
                {characterData.bonds.length}/2
              </span>
            </div>

            {/* Current Bonds */}
            {characterData.bonds.length > 0 && (
              <div className="space-y-2">
                {characterData.bonds.map((bond, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-green-500/10 border border-green-400/20 rounded-lg p-3"
                  >
                    <span className="text-green-200 text-sm">{bond}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeBond(index)}
                      className="text-green-400 hover:text-green-300 h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Bond */}
            {characterData.bonds.length < 2 && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={newBond}
                    onChange={(e) => setNewBond(e.target.value)}
                    placeholder="Digite um vínculo..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-purple-300/70"
                    onKeyPress={(e) => e.key === "Enter" && addBond()}
                  />
                  <Button
                    onClick={addBond}
                    disabled={!newBond.trim()}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/30"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() =>
                      getRandomSample(
                        SAMPLE_BONDS,
                        characterData.bonds,
                        setNewBond
                      )
                    }
                    variant="outline"
                    className="bg-white/5 border-white/20"
                  >
                    <Dices className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flaws */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <Label className="text-white text-lg font-semibold">
                  Defeitos
                </Label>
              </div>
              <span className="text-purple-200 text-sm">
                {characterData.flaws.length}/2
              </span>
            </div>

            {/* Current Flaws */}
            {characterData.flaws.length > 0 && (
              <div className="space-y-2">
                {characterData.flaws.map((flaw, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-red-500/10 border border-red-400/20 rounded-lg p-3"
                  >
                    <span className="text-red-200 text-sm">{flaw}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFlaw(index)}
                      className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Flaw */}
            {characterData.flaws.length < 2 && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={newFlaw}
                    onChange={(e) => setNewFlaw(e.target.value)}
                    placeholder="Digite um defeito..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-purple-300/70"
                    onKeyPress={(e) => e.key === "Enter" && addFlaw()}
                  />
                  <Button
                    onClick={addFlaw}
                    disabled={!newFlaw.trim()}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() =>
                      getRandomSample(
                        SAMPLE_FLAWS,
                        characterData.flaws,
                        setNewFlaw
                      )
                    }
                    variant="outline"
                    className="bg-white/5 border-white/20"
                  >
                    <Dices className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Character Summary */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Label className="text-white text-lg font-semibold">
              Resumo do Personagem
            </Label>

            <div className="bg-black/20 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-purple-200">Nome:</span>
                  <span className="text-white ml-2">
                    {characterData.name || "Sem nome"}
                  </span>
                </div>
                <div>
                  <span className="text-purple-200">Nível:</span>
                  <span className="text-white ml-2">{characterData.level}</span>
                </div>
                <div>
                  <span className="text-purple-200">Raça:</span>
                  <span className="text-white ml-2">
                    {characterData.selectedRace?.name || "Não selecionada"}
                  </span>
                </div>
                <div>
                  <span className="text-purple-200">Classe:</span>
                  <span className="text-white ml-2">
                    {characterData.selectedClass?.name || "Não selecionada"}
                  </span>
                </div>
                <div>
                  <span className="text-purple-200">Background:</span>
                  <span className="text-white ml-2">
                    {characterData.selectedBackground?.name ||
                      "Não selecionado"}
                  </span>
                </div>
                <div>
                  <span className="text-purple-200">Tendência:</span>
                  <span className="text-white ml-2">
                    {characterData.alignment
                      ? ALIGNMENTS.find(
                          (a) => a.value === characterData.alignment
                        )?.label
                      : "Não selecionada"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-500/10 border-blue-400/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-200 font-semibold text-sm">
                Dicas de Personalização
              </h4>
              <p className="text-blue-100 text-sm mt-1">
                <strong>Traços</strong> são características marcantes da
                personalidade.
                <strong>Ideais</strong> são princípios que motivam o personagem.
                <strong>Vínculos</strong> conectam o personagem ao mundo.
                <strong>Defeitos</strong> são fraquezas que humanizam o
                personagem e criam oportunidades para interpretação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
