
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Clock, 
  Network, 
  MessageSquare, 
  FileText, 
  Shield, 
  Eye,
  EyeOff,
  Download,
  Share
} from 'lucide-react';
import { EventTimeline } from './EventTimeline';
import { CharacterRelationWeb } from './CharacterRelationWeb';
import { DialogueGallery } from './DialogueGallery';
import { SceneConstructor } from './SceneConstructor';
import { CredibilityLayer } from './CredibilityLayer';

interface AnalysisResult {
  events: Array<{
    id: string;
    title: string;
    description: string;
    participants: string[];
    location: string;
    timeframe: string;
    significance_level: number;
    credibility_score: number;
    original_excerpt: string;
    timestamp?: string;
  }>;
  characters: Array<{
    id: string;
    name: string;
    role: string;
    traits: string[];
    quotes: string[];
    credibility_assessment: number;
    relationships: Array<{
      target_id: string;
      relationship_type: 'ally' | 'enemy' | 'neutral' | 'family' | 'friend';
      strength: number;
    }>;
  }>;
  dialogues: Array<{
    id: string;
    speaker: string;
    content: string;
    emotional_tone: string;
    literary_value: number;
    context: string;
    credibility_score: number;
    participants: string[];
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
}

interface InteractiveWitnessDashboardProps {
  analysisResult: AnalysisResult;
  onElementDrag: (element: any, type: 'event' | 'character' | 'dialogue') => void;
  onSceneCreate: (elements: any[]) => void;
}

type ViewMode = 'timeline' | 'network' | 'gallery' | 'constructor' | 'overview';

export const InteractiveWitnessDashboard: React.FC<InteractiveWitnessDashboardProps> = ({
  analysisResult,
  onElementDrag,
  onSceneCreate
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [faithfulMode, setFaithfulMode] = useState(true);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [showCredibilityLayer, setShowCredibilityLayer] = useState(true);

  const handleElementSelect = useCallback((element: any, type: string) => {
    const elementWithType = { ...element, elementType: type };
    setSelectedElements(prev => {
      const exists = prev.find(e => e.id === element.id && e.elementType === type);
      if (exists) {
        return prev.filter(e => !(e.id === element.id && e.elementType === type));
      }
      return [...prev, elementWithType];
    });
  }, []);

  const handleCreateScene = () => {
    if (selectedElements.length > 0) {
      onSceneCreate(selectedElements);
      setCurrentView('constructor');
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50';
    if (score >= 0.7) return 'text-blue-600 bg-blue-50';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50';
    if (score >= 0.3) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const renderViewControls = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4 space-x-reverse">
        <h2 className="text-2xl font-bold">محرك السرد التفاعلي للشاهد</h2>
        <Badge variant="outline" className={getCredibilityColor(analysisResult.credibility_assessment.overall_score)}>
          مصداقية: {Math.round(analysisResult.credibility_assessment.overall_score * 100)}%
        </Badge>
      </div>
      
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Switch
            checked={showCredibilityLayer}
            onCheckedChange={setShowCredibilityLayer}
          />
          <label className="text-sm">عرض طبقة المصداقية</label>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <Switch
            checked={faithfulMode}
            onCheckedChange={setFaithfulMode}
          />
          <label className="text-sm">
            {faithfulMode ? 'وضع التحرير الأمين' : 'وضع التحرير الإبداعي'}
          </label>
        </div>
        
        {selectedElements.length > 0 && (
          <Button onClick={handleCreateScene} className="bg-purple-600 hover:bg-purple-700">
            <FileText className="w-4 h-4 ml-2" />
            إنشاء مشهد ({selectedElements.length})
          </Button>
        )}
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="flex items-center space-x-2 space-x-reverse mb-6">
      <Button
        variant={currentView === 'overview' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setCurrentView('overview')}
      >
        <Eye className="w-4 h-4 ml-1" />
        نظرة عامة
      </Button>
      
      <Button
        variant={currentView === 'timeline' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setCurrentView('timeline')}
      >
        <Clock className="w-4 h-4 ml-1" />
        الخط الزمني
      </Button>
      
      <Button
        variant={currentView === 'network' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setCurrentView('network')}
      >
        <Network className="w-4 h-4 ml-1" />
        شبكة الشخصيات
      </Button>
      
      <Button
        variant={currentView === 'gallery' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setCurrentView('gallery')}
      >
        <MessageSquare className="w-4 h-4 ml-1" />
        معرض الحوارات
      </Button>
      
      <Button
        variant={currentView === 'constructor' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setCurrentView('constructor')}
      >
        <FileText className="w-4 h-4 ml-1" />
        محرر المشاهد
      </Button>
    </div>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('timeline')}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>خريطة الأحداث الزمنية</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 mb-2">{analysisResult.events.length}</div>
          <p className="text-sm text-gray-600 mb-4">حدث مستخرج من الشهادة</p>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (analysisResult.events.length / 10) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">تم التحليل</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('network')}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
            <Network className="w-5 h-5 text-green-600" />
            <span>شبكة الشخصيات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 mb-2">{analysisResult.characters.length}</div>
          <p className="text-sm text-gray-600 mb-4">شخصية مع علاقات محددة</p>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (analysisResult.characters.length / 5) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">مترابطة</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('gallery')}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span>معرض الحوارات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600 mb-2">{analysisResult.dialogues.length}</div>
          <p className="text-sm text-gray-600 mb-4">حوار بقيمة أدبية عالية</p>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (analysisResult.dialogues.filter(d => d.literary_value > 0.7).length / analysisResult.dialogues.length) * 100)}%` 
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">جودة عالية</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'timeline':
        return (
          <EventTimeline
            events={analysisResult.events}
            onEventSelect={(event) => handleElementSelect(event, 'event')}
            selectedEvents={selectedElements.filter(e => e.elementType === 'event')}
            showCredibilityLayer={showCredibilityLayer}
            onEventDrag={onElementDrag}
          />
        );
      
      case 'network':
        return (
          <CharacterRelationWeb
            characters={analysisResult.characters}
            onCharacterSelect={(character) => handleElementSelect(character, 'character')}
            selectedCharacters={selectedElements.filter(e => e.elementType === 'character')}
            showCredibilityLayer={showCredibilityLayer}
            onCharacterDrag={onElementDrag}
          />
        );
      
      case 'gallery':
        return (
          <DialogueGallery
            dialogues={analysisResult.dialogues}
            onDialogueSelect={(dialogue) => handleElementSelect(dialogue, 'dialogue')}
            selectedDialogues={selectedElements.filter(e => e.elementType === 'dialogue')}
            showCredibilityLayer={showCredibilityLayer}
            onDialogueToScene={(dialogue) => onSceneCreate([{ ...dialogue, elementType: 'dialogue' }])}
            onDialogueDrag={onElementDrag}
          />
        );
      
      case 'constructor':
        return (
          <SceneConstructor
            selectedElements={selectedElements}
            faithfulMode={faithfulMode}
            analysisResult={analysisResult}
            onElementsChange={setSelectedElements}
          />
        );
      
      case 'overview':
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {renderViewControls()}
      {renderNavigation()}
      
      {showCredibilityLayer && (
        <CredibilityLayer
          analysisResult={analysisResult}
          faithfulMode={faithfulMode}
        />
      )}
      
      {renderCurrentView()}
    </div>
  );
};
