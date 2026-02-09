import { useContext } from 'react';
import { AudioFlowContext } from '../context/audio-flow-provider';

/**
 * Hook to access the audio flow context
 * Must be used within AudioFlowProvider
 */
export function useAudioFlow() {
  const context = useContext(AudioFlowContext);
  
  if (!context) {
    throw new Error('useAudioFlow must be used within AudioFlowProvider');
  }
  
  return context;
}
