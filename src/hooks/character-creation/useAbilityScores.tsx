import React, { useState } from 'react';
import { useCharacterCreationContext } from '@/hooks/useCharacterCreation';
import { Target, Shield, Dice6 } from 'lucide-react';

const ABILITY_METHODS = [
  {
    id: 'point-buy' as const,
    name: 'Compra de Pontos',
    description: 'Distribua 27 pontos entre as habilidades (8-15)',
    icon: Target
  },
  {
    id: 'standard' as const,
    name: 'Array Padrão',
    description: 'Use os valores padrão: 15, 14, 13, 12, 10, 8',
    icon: Shield
  },
  {
    id: 'rolled' as const,
    name: 'Rolagem',
    description: 'Role 4d6, descarte o menor (simulado)',
    icon: Dice6
  }
];

export default function AbilityScoresStep() {
  const context = useCharacterCreationContext();
  
  // Acessar o orchestrator diretamente agora que está exposto
  const orchestrator = (context as any).orchestrator || {};
  
  console.log('🔍 [AbilityScoresStep] Full context:', context);
  console.log('🔍 [AbilityScoresStep] Orchestrator:', orchestrator);
  console.log('🔍 [AbilityScoresStep] abilities hook:', orchestrator.abilities);

  const {
    characterData,
    updateCharacterField,
    updateAbilityScore,
  } = context;

  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('🔧', logMessage);
    setDebugLog(prev => [...prev.slice(-9), logMessage]);
  };

  const handleMethodChange = (method: 'point-buy' | 'standard' | 'rolled') => {
    addLog(`Method change clicked: ${method}`);
    
    try {
      if (!updateCharacterField) {
        addLog('ERROR: updateCharacterField is not available');
        return;
      }
      
      addLog(`Calling updateCharacterField with: abilityMethod = ${method}`);
      updateCharacterField('abilityMethod', method);
      addLog(`updateCharacterField call completed`);
      
    } catch (error) {
      addLog(`ERROR in handleMethodChange: ${error}`);
    }
  };

  const testDirectOrchestratorCall = () => {
    addLog('Testing direct orchestrator call');
    try {
      if (orchestrator.abilities && orchestrator.abilities.changeMethod) {
        const beforeMethod = orchestrator.abilities.method;
        addLog(`Before: ${beforeMethod}`);
        
        orchestrator.abilities.changeMethod('point-buy');
        
        const afterMethod = orchestrator.abilities.method;
        addLog(`After: ${afterMethod}`);
        addLog('Direct call completed successfully!');
      } else {
        addLog('ERROR: orchestrator.abilities.changeMethod not available');
        addLog(`Available: ${Object.keys(orchestrator.abilities || {}).join(', ')}`);
      }
    } catch (error) {
      addLog(`ERROR in testDirectOrchestratorCall: ${error}`);
    }
  };

  const testDirectMethodCall = () => {
    addLog('Testing direct method call (bypassing context)');
    try {
      if (orchestrator.abilities && orchestrator.abilities.changeMethod) {
        // Converter tipo para compatibilidade
        const methodMap = {
          'point-buy': 'point-buy' as const,
          'standard': 'standard-array' as const,
          'rolled': 'roll' as const
        };
        
        const method = methodMap['point-buy'];
        addLog(`Calling changeMethod directly with: ${method}`);
        orchestrator.abilities.changeMethod(method);
        addLog(`Direct call result - method is now: ${orchestrator.abilities.method}`);
      }
    } catch (error) {
      addLog(`ERROR in testDirectMethodCall: ${error}`);
    }
  };

  const testAbilityUpdate = () => {
    addLog('Testing ability update');
    try {
      if (!updateAbilityScore) {
        addLog('ERROR: updateAbilityScore is not available');
        return;
      }
      
      updateAbilityScore('strength', 10);
      addLog('Ability update test completed');
    } catch (error) {
      addLog(`ERROR in testAbilityUpdate: ${error}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Debug Panel */}
      <div className="bg-gray-900/80 rounded-xl p-6 border border-yellow-500/50">
        <h3 className="text-yellow-400 font-semibold mb-4">🔍 Enhanced Debug Panel v2</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Context Status</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>characterData: {characterData ? '✅' : '❌'}</div>
              <div>updateCharacterField: {updateCharacterField ? '✅' : '❌'}</div>
              <div>updateAbilityScore: {updateAbilityScore ? '✅' : '❌'}</div>
              <div>Current Method: {characterData?.abilityMethod || 'undefined'}</div>
              <div>Strength: {characterData?.abilityScores?.strength || 'undefined'}</div>
              <div>orchestrator.abilities: {orchestrator.abilities ? '✅' : '❌'}</div>
              <div>changeMethod: {orchestrator.abilities?.changeMethod ? '✅' : '❌'}</div>
              <div>Direct method: {orchestrator.abilities?.method || 'undefined'}</div>
              <div>Direct scores: {JSON.stringify(orchestrator.abilities?.scores || {})}</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Test Buttons</h4>
            <div className="space-y-2">
              <button
                onClick={testAbilityUpdate}
                className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Test Ability Update
              </button>
              <button
                onClick={() => handleMethodChange('point-buy')}
                className="w-full px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Test Method Change (Context)
              </button>
              <button
                onClick={testDirectOrchestratorCall}
                className="w-full px-3 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
              >
                Test Direct Call
              </button>
              <button
                onClick={testDirectMethodCall}
                className="w-full px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Test Direct Method (Mapped)
              </button>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Debug Log</h4>
          <div className="bg-black/50 rounded p-2 max-h-32 overflow-y-auto">
            {debugLog.length === 0 ? (
              <div className="text-xs text-gray-500">No logs yet...</div>
            ) : (
              debugLog.map((log, index) => (
                <div key={index} className="text-xs text-green-400 font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Method Selection - With Extra Debug */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Método de Geração</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ABILITY_METHODS.map((method) => {
            const isSelected = characterData?.abilityMethod === method.id;
            const isDirectSelected = orchestrator.abilities?.method === method.id || 
              (method.id === 'standard' && orchestrator.abilities?.method === 'standard-array') ||
              (method.id === 'rolled' && orchestrator.abilities?.method === 'roll');
            const MethodIcon = method.icon;
            
            return (
              <div key={method.id} className="space-y-2">
                {/* Button Version */}
                <button
                  onClick={() => {
                    addLog(`Button clicked for ${method.id}`);
                    handleMethodChange(method.id);
                  }}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-400/50 shadow-lg shadow-blue-500/25'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-blue-500/20 text-blue-300' 
                        : 'bg-gray-700/50 text-gray-400'
                    }`}>
                      <MethodIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        isSelected ? 'text-blue-300' : 'text-white'
                      }`}>
                        {method.name}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {method.description}
                      </p>
                      <div className="text-xs mt-2">
                        <span className={isSelected ? 'text-green-400' : 'text-gray-500'}>
                          Context: {isSelected ? '✅' : '❌'}
                        </span>
                        {' | '}
                        <span className={isDirectSelected ? 'text-green-400' : 'text-gray-500'}>
                          Direct: {isDirectSelected ? '✅' : '❌'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw Data Display */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
        <h4 className="font-medium text-white mb-3">Raw Character Data</h4>
        <pre className="text-xs text-gray-400 overflow-auto max-h-64">
          {JSON.stringify({
            characterData: characterData,
            orchestratorMethod: orchestrator.abilities?.method,
            orchestratorScores: orchestrator.abilities?.scores,
            orchestratorFunctions: Object.keys(orchestrator.abilities || {}),
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}