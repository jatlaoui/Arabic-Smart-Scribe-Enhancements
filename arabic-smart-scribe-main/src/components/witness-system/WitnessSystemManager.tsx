
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  BarChart3, 
  Wand2,
  ArrowLeft,
  FileText,
  Zap
} from 'lucide-react';
import { WitnessUploader } from './WitnessUploader';
import { WitnessLibrary } from './WitnessLibrary';
import { WitnessAnalyzer } from './WitnessAnalyzer';
import { WitnessIntegrator } from './WitnessIntegrator';
import { InteractiveWitnessManager } from './InteractiveWitnessManager';

type ViewMode = 'library' | 'upload' | 'analyze' | 'integrate' | 'interactive';

interface WitnessSource {
  id: number;
  title: string;
  description: string;
  transcript: string;
  source_type: 'video' | 'audio' | 'written';
  created_at: string;
  analysis_stats: {
    word_count: number;
    estimated_duration: number;
  };
  credibility_score?: number;
  events_count?: number;
  characters_count?: number;
  dialogues_count?: number;
}

interface AnalysisResult {
  events: Array<{
    title: string;
    description: string;
    participants: string[];
    location: string;
    timeframe: string;
    significance_level: number;
  }>;
  characters: Array<{
    name: string;
    role: string;
    traits: string[];
    quotes: string[];
    credibility_assessment: number;
  }>;
  dialogues: Array<{
    speaker: string;
    content: string;
    emotional_tone: string;
    literary_value: number;
    context: string;
  }>;
  credibility_assessment: {
    overall_score: number;
    factors: {
      consistency: number;
      detail_level: number;
      emotional_authenticity: number;
      factual_accuracy: number;
    };
    level: string;
  };
  literary_elements: {
    narrative_patterns: string[];
    dramatic_moments: string[];
    character_development: string[];
    symbolic_elements: string[];
  };
}

export const WitnessSystemManager: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [sources, setSources] = useState<WitnessSource[]>([
    {
      id: 1,
      title: "شهادة أحمد محمد - حرب أكتوبر",
      description: "شهادة مفصلة عن أحداث حرب أكتوبر 1973 من منظور جندي مشارك",
      transcript: "في ذلك اليوم من أكتوبر، كنا نستعد للهجوم المباغت...",
      source_type: 'video',
      created_at: '2024-01-15T10:30:00Z',
      analysis_stats: {
        word_count: 1250,
        estimated_duration: 8
      },
      credibility_score: 0.92,
      events_count: 5,
      characters_count: 3,
      dialogues_count: 7
    },
    {
      id: 2,
      title: "مقابلة مع الحاجة فاطمة - ذكريات الريف",
      description: "حديث شيق عن الحياة في الريف المصري في الستينيات",
      transcript: "كانت أيام الريف جميلة، نستيقظ مع أذان الفجر...",
      source_type: 'audio',
      created_at: '2024-01-10T14:20:00Z',
      analysis_stats: {
        word_count: 890,
        estimated_duration: 6
      },
      credibility_score: 0.88,
      events_count: 3,
      characters_count: 5,
      dialogues_count: 4
    }
  ]);
  const [selectedSource, setSelectedSource] = useState<WitnessSource | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleUploadSuccess = (newSource: WitnessSource) => {
    setSources(prev => [newSource, ...prev]);
    setViewMode('library');
  };

  const handleSelectSource = (source: WitnessSource) => {
    setSelectedSource(source);
    setViewMode('analyze');
  };

  const handleDeleteSource = (id: number) => {
    setSources(prev => prev.filter(source => source.id !== id));
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    // تحديث إحصائيات المصدر
    if (selectedSource) {
      setSources(prev => prev.map(source => 
        source.id === selectedSource.id
          ? {
              ...source,
              credibility_score: result.credibility_assessment.overall_score,
              events_count: result.events.length,
              characters_count: result.characters.length,
              dialogues_count: result.dialogues.length
            }
          : source
      ));
    }
  };

  const handleIntegrationComplete = (enhancedText: string) => {
    console.log('Enhanced text:', enhancedText);
    // هنا يمكن إرسال النص المحسن إلى المحرر الرئيسي
  };

  const handleInteractiveMode = (source: WitnessSource) => {
    setSelectedSource(source);
    setViewMode('interactive');
  };

  const goBack = () => {
    if (viewMode === 'integrate') {
      setViewMode('analyze');
    } else if (viewMode === 'interactive') {
      setViewMode('library');
      setSelectedSource(null);
    } else {
      setViewMode('library');
      setSelectedSource(null);
      setAnalysisResult(null);
    }
  };

  const renderNavigation = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4 space-x-reverse">
        {viewMode !== 'library' && (
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
        )}
        <div className="flex items-center space-x-2 space-x-reverse">
          <FileText className="w-6 h-6" />
          <h1 className="text-2xl font-bold">نظام استخلاص الشاهد</h1>
        </div>
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <Badge variant="secondary">
          {sources.length} مصدر
        </Badge>
        {viewMode === 'library' && (
          <Button onClick={() => setViewMode('upload')}>
            <Upload className="w-4 h-4 ml-2" />
            رفع ترانسكريبت جديد
          </Button>
        )}
        {viewMode === 'analyze' && analysisResult && (
          <>
            <Button onClick={() => setViewMode('integrate')}>
              <Wand2 className="w-4 h-4 ml-2" />
              دمج في النص
            </Button>
            <Button 
              onClick={() => selectedSource && handleInteractiveMode(selectedSource)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="w-4 h-4 ml-2" />
              المحرك التفاعلي
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'upload':
        return <WitnessUploader onUploadSuccess={handleUploadSuccess} />;
      
      case 'analyze':
        return selectedSource ? (
          <WitnessAnalyzer 
            source={selectedSource} 
            onAnalysisComplete={handleAnalysisComplete}
          />
        ) : null;
      
      case 'integrate':
        return analysisResult ? (
          <WitnessIntegrator 
            analysisResult={analysisResult}
            onIntegrationComplete={handleIntegrationComplete}
          />
        ) : null;

      case 'interactive':
        return selectedSource ? (
          <InteractiveWitnessManager
            source={selectedSource}
            onBack={goBack}
          />
        ) : null;
      
      case 'library':
      default:
        return (
          <WitnessLibrary 
            sources={sources}
            onSelectSource={handleSelectSource}
            onDeleteSource={handleDeleteSource}
          />
        );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {viewMode !== 'interactive' && renderNavigation()}
      {renderContent()}
    </div>
  );
};
