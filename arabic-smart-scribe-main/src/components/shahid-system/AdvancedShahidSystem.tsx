
import React, { useState, useCallback } from 'react';
import { ContextEngine } from './ContextEngine';
import { VisualStoryboard } from './VisualStoryboard';
import { InteractiveStyleEditor } from './InteractiveStyleEditor';
import { PhaseHeader } from './PhaseHeader';
import { UploadPhase } from './UploadPhase';
import { EnhancementPhase } from './EnhancementPhase';
import { ConstructionPhase } from './ConstructionPhase';
import { QuickActions } from './QuickActions';
import { useToast } from '@/hooks/use-toast';

interface ShahidAnalysis {
  transcript: string;
  historical_context: any;
  emotional_arc: any;
  narrative_structure: any;
  credibility_assessment: {
    overall_score: number;
    fact_check_status: 'verified' | 'disputed' | 'unverified';
  };
}

interface GeneratedScene {
  title: string;
  content: string;
  metadata: any;
}

export const AdvancedShahidSystem: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<'upload' | 'analysis' | 'enhancement' | 'construction' | 'storyboard' | 'styling'>('upload');
  const [shahidAnalysis, setShahidAnalysis] = useState<ShahidAnalysis | null>(null);
  const [generatedScenes, setGeneratedScenes] = useState<GeneratedScene[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [sensoryDetails, setSensoryDetails] = useState<any[]>([]);
  const [metaphors, setMetaphors] = useState<any[]>([]);
  const [internalThoughts, setInternalThoughts] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileUpload = useCallback((files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    setCurrentPhase('analysis');
    setOverallProgress(15);
    
    toast({
      title: "تم رفع الملف بنجاح",
      description: "بدء التحليل العميق للمحتوى...",
    });
  }, []);

  const handleAnalysisComplete = (analysis: any) => {
    setShahidAnalysis({
      transcript: "نص الشهادة المحلل...",
      historical_context: analysis.historical_context,
      emotional_arc: analysis.emotional_arc,
      narrative_structure: analysis.narrative_structure,
      credibility_assessment: {
        overall_score: 0.85,
        fact_check_status: 'verified'
      }
    });
    
    setCurrentPhase('enhancement');
    setOverallProgress(35);
    
    toast({
      title: "اكتمل التحليل العميق",
      description: "انتقل الآن لمرحلة تعزيز المحتوى",
    });
  };

  const handleEnhancementComplete = () => {
    setCurrentPhase('construction');
    setOverallProgress(60);
    
    toast({
      title: "اكتمل تعزيز المحتوى",
      description: "يمكنك الآن البدء في بناء المشاهد الأدبية",
    });
  };

  const handleSceneGenerated = (scene: any) => {
    const newScene: GeneratedScene = {
      title: scene.title,
      content: scene.narrative_flow,
      metadata: scene
    };
    
    setGeneratedScenes(prev => [...prev, newScene]);
    setOverallProgress(80);
    
    toast({
      title: "تم إنشاء مشهد جديد",
      description: scene.title,
    });
  };

  const handleMoveToStoryboard = () => {
    setCurrentPhase('storyboard');
    setOverallProgress(95);
  };

  const handleOpenStyleEditor = (text: string) => {
    setSelectedText(text);
    setShowStyleEditor(true);
  };

  return (
    <div className="space-y-6">
      <PhaseHeader 
        currentPhase={currentPhase}
        overallProgress={overallProgress}
      />

      {currentPhase === 'upload' && (
        <UploadPhase onFileUpload={handleFileUpload} />
      )}

      {currentPhase === 'analysis' && (
        <ContextEngine
          transcriptText="نص الشهادة..."
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}

      {currentPhase === 'enhancement' && shahidAnalysis && (
        <EnhancementPhase
          selectedText={selectedText}
          sensoryDetails={sensoryDetails}
          metaphors={metaphors}
          internalThoughts={internalThoughts}
          onSensoryDetailsGenerated={setSensoryDetails}
          onMetaphorsGenerated={setMetaphors}
          onInternalThoughtsGenerated={setInternalThoughts}
          onEnhancementComplete={handleEnhancementComplete}
        />
      )}

      {currentPhase === 'construction' && shahidAnalysis && (
        <ConstructionPhase
          shahidAnalysis={shahidAnalysis}
          sensoryDetails={sensoryDetails}
          metaphors={metaphors}
          internalThoughts={internalThoughts}
          generatedScenes={generatedScenes}
          onSceneGenerated={handleSceneGenerated}
          onMoveToStoryboard={handleMoveToStoryboard}
          onOpenStyleEditor={handleOpenStyleEditor}
        />
      )}

      {currentPhase === 'storyboard' && (
        <VisualStoryboard
          generatedScenes={generatedScenes}
          onSceneReorder={(scenes) => console.log('Scenes reordered:', scenes)}
          onSceneEdit={(sceneId) => setCurrentPhase('styling')}
          onSceneAdd={(afterSceneId) => console.log('Add scene after:', afterSceneId)}
        />
      )}

      {showStyleEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <InteractiveStyleEditor
              selectedText={selectedText}
              onTextChange={(newText) => {
                console.log('Text changed:', newText);
                setShowStyleEditor(false);
              }}
              onClose={() => setShowStyleEditor(false)}
            />
          </div>
        </div>
      )}

      <QuickActions generatedScenes={generatedScenes} />
    </div>
  );
};
