
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WitnessAnalyzer } from './WitnessAnalyzer';
import { InteractiveWitnessDashboard } from './InteractiveWitnessDashboard';
import { 
  ArrowLeft,
  FileText,
  Zap,
  Eye,
  Settings
} from 'lucide-react';

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
  literary_elements: {
    narrative_patterns: string[];
    dramatic_moments: string[];
    character_development: string[];
    symbolic_elements: string[];
  };
}

interface InteractiveWitnessManagerProps {
  source: WitnessSource;
  onBack: () => void;
}

export const InteractiveWitnessManager: React.FC<InteractiveWitnessManagerProps> = ({
  source,
  onBack
}) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentMode, setCurrentMode] = useState<'analyze' | 'dashboard'>('analyze');
  const [selectedElements, setSelectedElements] = useState<any[]>([]);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentMode('dashboard');
  };

  const handleElementDrag = (element: any, type: string) => {
    console.log('عنصر مسحوب:', element, 'نوع:', type);
  };

  const handleSceneCreate = (elements: any[]) => {
    setSelectedElements(elements);
    console.log('إنشاء مشهد من العناصر:', elements);
  };

  const generateMockAnalysisResult = (): AnalysisResult => {
    return {
      events: [
        {
          id: '1',
          title: 'معركة القنال',
          description: 'وصف تفصيلي لأحداث معركة هامة على ضفاف القنال',
          participants: ['الراوي', 'زملاء القتال', 'القائد محمود'],
          location: 'ضفة القنال الشرقية',
          timeframe: 'أكتوبر 1973، الساعة السادسة مساءً',
          significance_level: 0.95,
          credibility_score: 0.92,
          original_excerpt: 'كانت المدافع تدوي من حولنا والدخان يملأ السماء...',
          timestamp: '1973-10-06T18:00:00Z'
        },
        {
          id: '2',
          title: 'لقاء مع القائد',
          description: 'محادثة مهمة مع القائد قبل بدء العملية',
          participants: ['الراوي', 'القائد محمود'],
          location: 'خيمة القيادة',
          timeframe: 'قبل المعركة بساعتين',
          significance_level: 0.78,
          credibility_score: 0.88,
          original_excerpt: 'دخلت إلى خيمة القائد وكان يدرس الخرائط بعناية...',
          timestamp: '1973-10-06T16:00:00Z'
        }
      ],
      characters: [
        {
          id: '1',
          name: 'القائد محمود',
          role: 'قائد الوحدة',
          traits: ['حكيم', 'شجاع', 'محنك'],
          quotes: ['النصر لن يأتي بدون تضحية', 'ثقوا في قدراتكم'],
          credibility_assessment: 0.95,
          relationships: [
            {
              target_id: '2',
              relationship_type: 'ally',
              strength: 0.9
            }
          ]
        },
        {
          id: '2',
          name: 'أحمد الجندي',
          role: 'جندي مقاتل',
          traits: ['شجاع', 'مخلص', 'صغير السن'],
          quotes: ['سنعود منتصرين إن شاء الله'],
          credibility_assessment: 0.82,
          relationships: [
            {
              target_id: '1',
              relationship_type: 'ally',
              strength: 0.85
            }
          ]
        }
      ],
      dialogues: [
        {
          id: '1',
          speaker: 'القائد محمود',
          content: 'اليوم سنكتب التاريخ بدمائنا وعرقنا، فلنكن على قدر المسؤولية',
          emotional_tone: 'حماسي ومؤثر',
          literary_value: 0.92,
          context: 'خطاب ما قبل المعركة',
          credibility_score: 0.94,
          participants: ['القائد محمود', 'الجنود']
        },
        {
          id: '2',
          speaker: 'أحمد الجندي',
          content: 'يا أستاذ محمود، هل تعتقد أننا سننتصر؟',
          emotional_tone: 'قلق ومتردد',
          literary_value: 0.76,
          context: 'سؤال قبل بدء العملية',
          credibility_score: 0.87,
          participants: ['أحمد الجندي', 'القائد محمود']
        }
      ],
      credibility_assessment: {
        overall_score: 0.89,
        factors: {
          consistency: 0.92,
          detail_level: 0.88,
          emotional_authenticity: 0.91,
          factual_accuracy: 0.85
        },
        level: 'عالية'
      },
      literary_elements: {
        narrative_patterns: ['السرد التسلسلي', 'الحوار المباشر', 'الوصف التفصيلي'],
        dramatic_moments: ['لحظة بدء المعركة', 'خطاب القائد', 'سؤال الجندي الصغير'],
        character_development: ['تطور شخصية القائد كمرشد', 'نمو الجندي الصغير'],
        symbolic_elements: ['الدخان كرمز للحرب', 'الخرائط كرمز للتخطيط']
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* شريط التنقل */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <div className="flex items-center space-x-2 space-x-reverse">
            <FileText className="w-6 h-6" />
            <h1 className="text-2xl font-bold">محرك السرد التفاعلي</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Badge variant="secondary">
            {source.title}
          </Badge>
          {analysisResult && (
            <Button
              variant={currentMode === 'analyze' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentMode('analyze')}
            >
              <Settings className="w-4 h-4 ml-1" />
              التحليل
            </Button>
          )}
          {analysisResult && (
            <Button
              variant={currentMode === 'dashboard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentMode('dashboard')}
            >
              <Zap className="w-4 h-4 ml-1" />
              اللوحة التفاعلية
            </Button>
          )}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      {currentMode === 'analyze' && (
        <WitnessAnalyzer
          source={source}
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}

      {currentMode === 'dashboard' && analysisResult && (
        <InteractiveWitnessDashboard
          analysisResult={analysisResult}
          onElementDrag={handleElementDrag}
          onSceneCreate={handleSceneCreate}
        />
      )}

      {/* زر التجربة السريعة للتطوير */}
      {!analysisResult && (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">تجربة سريعة</h3>
            <p className="text-gray-600 mb-4">
              للتطوير والاختبار، يمكنك تجربة النظام ببيانات تجريبية
            </p>
            <Button 
              onClick={() => handleAnalysisComplete(generateMockAnalysisResult())}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="w-4 h-4 ml-2" />
              تجربة النظام التفاعلي
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
