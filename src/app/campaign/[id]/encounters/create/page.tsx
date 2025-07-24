"use client"
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DifficultyLevel } from '@/types/createCampaign';
import { encounterAPI } from '@/api/encounterAPI';
import { validateCreateEncounterRequest } from '@/types/encounter';
import EncounterForm from '@/components/encounter/create/EncounterForm';
import { CreateEncounterRequest } from '@/types/encounter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function CreateEncounterPage() {
  const params = useParams()
  const campaignId = params?.id as string | undefined;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    console.log(campaignId)
  })
  // Log para depuração
  useEffect(() => {
    console.log("Params recebidos:", params);
    console.log("Campaign ID no CreateEncounterPage:", campaignId);
  }, [params, campaignId]);

  // Checagem básica
  if (!campaignId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>ID da campanha não foi fornecido.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSubmit = async (data: CreateEncounterRequest) => {
    const errors = validateCreateEncounterRequest(data);
    if (errors.length > 0) {
      setFeedback({
        type: 'error',
        message: `Erros de validação: ${errors.join(', ')}`,
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: null, message: '' });
    
    try {
      const response = await encounterAPI.createEncounter(campaignId, data);
      
      
      if (response.success) {
        setFeedback({
          type: 'success',
          message: 'Encontro criado com sucesso! Redirecionando...',
        });
        setTimeout(() => {
          router.push(`/campaigns/${campaignId}/encounters`);
        }, 1500);
      } else {
        setFeedback({
          type: 'error',
          message: response.error || 'Ocorreu um erro desconhecido ao criar o encontro',
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido na requisição',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Criar Novo Encontro
        </h1>
        
        {feedback.type && (
          <Alert
            variant={feedback.type === 'success' ? 'default' : 'destructive'}
            className="mb-6"
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertTitle className="ml-2">
              {feedback.type === 'success' ? 'Sucesso!' : 'Erro!'}
            </AlertTitle>
            <AlertDescription className="ml-2">
              {feedback.message}
            </AlertDescription>
          </Alert>
        )}
        
        <EncounterForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          campaignId={campaignId}
          initialData={{
            name: '',
            difficulty: DifficultyLevel.MEDIUM,
          }}
        />
      </div>
    </div>
  );
}