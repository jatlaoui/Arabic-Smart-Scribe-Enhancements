
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Users, 
  MessageSquare, 
  Calendar,
  MapPin,
  TrendingUp,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WitnessSource {
  id: number;
  title: string;
  transcript: string;
  source_type: string;
  analysis_stats: {
    word_count: number;
    estimated_duration: number;
  };
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

interface WitnessAnalyzerProps {
  source: WitnessSource;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export const WitnessAnalyzer: React.FC<WitnessAnalyzerProps> = ({ 
  source, 
  onAnalysisComplete 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    const steps = [
      { step: 'تحليل النص وتحديد العناصر الأساسية', duration: 2000 },
      { step: 'استخراج الأحداث والشخصيات', duration: 3000 },
      { step: 'تحليل الحوارات والمشاعر', duration: 2500 },
      { step: 'تقييم المصداقية والقيمة الأدبية', duration: 2000 },
      { step: 'إنتاج النتائج النهائية', duration: 1500 }
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        setAnalysisStep(steps[i].step);
        setProgress((i / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // محاكاة نتائج التحليل
      const mockResult: AnalysisResult = {
        events: [
          {
            title: "لحظة الحدث الرئيسي",
            description: "وصف تفصيلي للحدث كما ورد في الشهادة",
            participants: ["الشاهد", "شخصية أخرى"],
            location: "المكان المذكور",
            timeframe: "التوقيت المحدد",
            significance_level: 0.9
          }
        ],
        characters: [
          {
            name: "الشاهد الرئيسي",
            role: "راوي الأحداث",
            traits: ["صادق", "مفصل", "عاطفي"],
            quotes: ["اقتباس مهم من الشهادة"],
            credibility_assessment: 0.85
          }
        ],
        dialogues: [
          {
            speaker: "الشاهد",
            content: "جزء من الحوار المهم",
            emotional_tone: "حزين",
            literary_value: 0.8,
            context: "السياق المحيط بالحوار"
          }
        ],
        credibility_assessment: {
          overall_score: 0.87,
          factors: {
            consistency: 0.9,
            detail_level: 0.85,
            emotional_authenticity: 0.88,
            factual_accuracy: 0.84
          },
          level: "عالية"
        },
        literary_elements: {
          narrative_patterns: ["السرد التسلسلي", "الاسترجاع"],
          dramatic_moments: ["لحظة الكشف", "ذروة التوتر"],
          character_development: ["تطور نفسي", "تغيير الموقف"],
          symbolic_elements: ["رمز الأمل", "استعارة الرحلة"]
        }
      };

      setProgress(100);
      setAnalysisResult(mockResult);
      onAnalysisComplete(mockResult);
      
      toast({
        title: "اكتمل التحليل بنجاح",
        description: "تم استخراج جميع العناصر من الترانسكريبت"
      });

    } catch (error) {
      toast({
        title: "خطأ في التحليل",
        description: "حدث خطأ أثناء تحليل الترانسكريبت",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCredibilityBadge = (score: number) => {
    if (score >= 0.9) return <Badge className="bg-green-500">عالية جداً</Badge>;
    if (score >= 0.7) return <Badge className="bg-blue-500">عالية</Badge>;
    if (score >= 0.5) return <Badge className="bg-yellow-500">متوسطة</Badge>;
    if (score >= 0.3) return <Badge className="bg-orange-500">منخفضة</Badge>;
    return <Badge variant="destructive">مشكوك فيها</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2 space-x-reverse">
              <Brain className="w-5 h-5" />
              <span>تحليل ترانسكريبت: {source.title}</span>
            </span>
            {!isAnalyzing && !analysisResult && (
              <Button onClick={startAnalysis}>
                <TrendingUp className="w-4 h-4 ml-2" />
                بدء التحليل
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {source.analysis_stats.word_count}
              </div>
              <div className="text-sm text-gray-600">كلمة</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {source.analysis_stats.estimated_duration}
              </div>
              <div className="text-sm text-gray-600">دقيقة تقريبية</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {source.source_type === 'video' ? 'فيديو' : 
                 source.source_type === 'audio' ? 'صوتي' : 'مكتوب'}
              </div>
              <div className="text-sm text-gray-600">نوع المصدر</div>
            </div>
          </div>

          {isAnalyzing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{analysisStep}</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* نتائج المصداقية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <CheckCircle className="w-5 h-5" />
                <span>تقييم المصداقية</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>التقييم العام</span>
                  {getCredibilityBadge(analysisResult.credibility_assessment.overall_score)}
                </div>
                <div className="space-y-2">
                  {Object.entries(analysisResult.credibility_assessment.factors).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span>
                        {key === 'consistency' ? 'التماسك' :
                         key === 'detail_level' ? 'مستوى التفاصيل' :
                         key === 'emotional_authenticity' ? 'الأصالة العاطفية' :
                         'الدقة الواقعية'}
                      </span>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span>{Math.round(value * 100)}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${value * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الأحداث المستخرجة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Calendar className="w-5 h-5" />
                <span>الأحداث ({analysisResult.events.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.events.map((event, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="font-semibold text-sm mb-1">{event.title}</div>
                    <div className="text-xs text-gray-600 mb-2">{event.description}</div>
                    <div className="flex items-center space-x-2 space-x-reverse text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{event.location}</span>
                      <Clock className="w-3 h-3" />
                      <span>{event.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* الشخصيات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Users className="w-5 h-5" />
                <span>الشخصيات ({analysisResult.characters.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.characters.map((character, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-sm">{character.name}</div>
                      {getCredibilityBadge(character.credibility_assessment)}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">{character.role}</div>
                    <div className="flex flex-wrap gap-1">
                      {character.traits.map((trait, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{trait}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* الحوارات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <MessageSquare className="w-5 h-5" />
                <span>الحوارات ({analysisResult.dialogues.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.dialogues.map((dialogue, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="font-semibold text-sm mb-1">{dialogue.speaker}</div>
                    <div className="text-sm mb-2 italic">"{dialogue.content}"</div>
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline">{dialogue.emotional_tone}</Badge>
                      <span>قيمة أدبية: {Math.round(dialogue.literary_value * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
