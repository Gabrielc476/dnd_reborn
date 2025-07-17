// app/campaign/[id]/character-create/page.tsx
'use client';

import { Card } from "@/components/ui/card";
import RacesCreation from "@/components/character/creation/steps/Races";

export default function CharacterCreatePage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-8">Teste de Componente de Raças</h1>
        <RacesCreation />
      </Card>
    </div>
  );
}