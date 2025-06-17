
import React from 'react';
import { SceneConstructionEngine } from './SceneConstructionEngine';
import { GeneratedScenesGrid } from './GeneratedScenesGrid';

interface ConstructionPhaseProps {
  shahidAnalysis: any;
  sensoryDetails: any[];
  metaphors: any[];
  internalThoughts: any[];
  generatedScenes: any[];
  onSceneGenerated: (scene: any) => void;
  onMoveToStoryboard: () => void;
  onOpenStyleEditor: (text: string) => void;
}

export const ConstructionPhase: React.FC<ConstructionPhaseProps> = ({
  shahidAnalysis,
  sensoryDetails,
  metaphors,
  internalThoughts,
  generatedScenes,
  onSceneGenerated,
  onMoveToStoryboard,
  onOpenStyleEditor
}) => {
  return (
    <div className="space-y-6">
      <SceneConstructionEngine
        witnessStatement={shahidAnalysis.transcript}
        historicalContext={shahidAnalysis.historical_context}
        emotionalContext={shahidAnalysis.emotional_arc}
        sensoryDetails={sensoryDetails}
        metaphors={metaphors}
        internalThoughts={internalThoughts}
        onSceneGenerated={onSceneGenerated}
      />
      
      {generatedScenes.length > 0 && (
        <GeneratedScenesGrid
          generatedScenes={generatedScenes}
          onMoveToStoryboard={onMoveToStoryboard}
          onOpenStyleEditor={onOpenStyleEditor}
        />
      )}
    </div>
  );
};
