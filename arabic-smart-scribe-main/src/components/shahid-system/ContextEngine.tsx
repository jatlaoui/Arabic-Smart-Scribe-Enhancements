
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  MapPin, 
  Calendar, 
  Users, 
  Heart,
  TrendingUp,
  BookOpen,
  Lightbulb
} from 'lucide-react';

interface ContextAnalysis {
  historical_context: {
    period: string;
    key_figures: Array<{
      name: string;
      role: string;
      significance: string;
      relationship_type: 'ally' | 'enemy' | 'neutral';
    }>;
    locations: Array<{
      name: string;
      historical_significance: string;
      symbolic_meaning: string;
    }>;
    political_backdrop: string;
  };
  emotional_arc: {
    sentiment_timeline: Array<{
      timestamp: string;
      emotion: 'pride' | 'pain' | 'anger' | 'hope' | 'fear';
      intensity: number;
      context: string;
    }>;
    dominant_emotions: string[];
    emotional_peaks: Array<{
      moment: string;
      emotion: string;
      significance: string;
    }>;
  };
  narrative_structure: {
    turning_points: Array<{
      timestamp: string;
      event: string;
      impact: string;
      dramatic_weight: number;
    }>;
    character_development: Array<{
      stage: string;
      description: string;
      psychological_state: string;
    }>;
    themes: string[];
  };
}

interface ContextEngineProps {
  transcriptText: string;
  onAnalysisComplete: (analysis: ContextAnalysis) => void;
}

export const ContextEngine: React.FC<ContextEngineProps> = ({ 
  transcriptText, 
  onAnalysisComplete 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<ContextAnalysis | null>(null);
  const [activePhase, setActivePhase] = useState<'context' | 'emotional' | 'narrative'>('context');

  const runContextAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // محاكاة تحليل السياق التاريخي
      setActivePhase('context');
      for (let i = 0; i <= 33; i += 5) {
        setAnalysisProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // محاكاة تحليل القوس العاطفي
      setActivePhase('emotional');
      for (let i = 33; i <= 66; i += 5) {
        setAnalysisProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // محاكاة تحليل البنية السردية
      setActivePhase('narrative');
      for (let i = 66; i <= 100; i += 5) {
        setAnalysisProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // نتائج التحليل المحاكي
      const mockAnalysis: ContextAnalysis = {
        historical_context: {
          period: "فترة النضال التونسي 1950-1956",
          key_figures: [
            {
              name: "صالح بن يوسف",
              role: "زعيم المقاومة المسلحة",
              significance: "يمثل التيار الراديكالي في الحركة الوطنية",
              relationship_type: "ally"
            },
            {
              name: "الحبيب بورقيبة", 
              role: "زعيم التيار المعتدل",
              significance: "يفضل التفاوض على المقاومة المسلحة",
              relationship_type: "neutral"
            },
            {
              name: "لزهر الشرايطي",
              role: "قائد مجموعة المقاومة",
              significance: "رمز البسالة والتضحية في الجبال",
              relationship_type: "ally"
            }
          ],
          locations: [
            {
              name: "جبال الشعانبي",
              historical_significance: "معقل المقاومة المسلحة",
              symbolic_meaning: "رمز الصمود والحرية"
            },
            {
              name: "تازركة",
              historical_significance: "موقع مجزرة دموية",
              symbolic_meaning: "شاهد على وحشية الاستعمار"
            }
          ],
          political_backdrop: "انقسام حاد في الحركة الوطنية بين مؤيدي المقاومة المسلحة والتفاوض"
        },
        emotional_arc: {
          sentiment_timeline: [
            {
              timestamp: "00:02:15",
              emotion: "pride",
              intensity: 0.8,
              context: "التحدث عن قرار الانضمام للمقاومة"
            },
            {
              timestamp: "00:05:30",
              emotion: "pain",
              intensity: 0.9,
              context: "تذكر رفاق السلاح الذين استشهدوا"
            },
            {
              timestamp: "00:08:45",
              emotion: "anger",
              intensity: 0.7,
              context: "الحديث عن خيانة بعض المتعاونين"
            }
          ],
          dominant_emotions: ["فخر", "ألم", "حسرة", "أمل"],
          emotional_peaks: [
            {
              moment: "لحظة الانضمام للجبل",
              emotion: "تصميم وفخر",
              significance: "نقطة تحول في حياة الشاهد"
            },
            {
              moment: "فقدان الرفاق",
              emotion: "حزن عميق وألم",
              significance: "الثمن الباهظ للحرية"
            }
          ]
        },
        narrative_structure: {
          turning_points: [
            {
              timestamp: "00:01:30",
              event: "قرار الانضمام للمقاومة",
              impact: "تحول من شاب عادي إلى مقاتل",
              dramatic_weight: 0.9
            },
            {
              timestamp: "00:04:20",
              event: "أول عملية عسكرية",
              impact: "اختبار الشجاعة والالتزام",
              dramatic_weight: 0.8
            },
            {
              timestamp: "00:07:10",
              event: "خيانة أحد الرفاق",
              impact: "زعزعة الثقة وإعادة تقييم الولاءات",
              dramatic_weight: 0.85
            }
          ],
          character_development: [
            {
              stage: "البراءة",
              description: "شاب مثالي يحلم بالحرية",
              psychological_state: "حماس وطني بريء"
            },
            {
              stage: "الصحوة",
              description: "مواجهة قسوة الواقع",
              psychological_state: "صدمة وتصميم"
            },
            {
              stage: "النضج",
              description: "مقاتل متمرس يفهم ثمن الحرية",
              psychological_state: "حكمة مختلطة بالألم"
            }
          ],
          themes: [
            "الحرية والتضحية",
            "الهوية الوطنية",
            "صراع الأجيال",
            "ثمن المبادئ",
            "الخيانة والولاء"
          ]
        }
      };

      setAnalysis(mockAnalysis);
      onAnalysisComplete(mockAnalysis);
      
    } catch (error) {
      console.error('خطأ في التحليل:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Brain className="w-6 h-6 text-purple-600" />
            <span>محرك السياق التاريخي والثقافي</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                يقوم هذا المحرك بتحليل عميق للسياق التاريخي والثقافي، ورسم القوس العاطفي، وتحديد نقاط التحول السردية
              </p>
              
              {isAnalyzing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {activePhase === 'context' && 'تحليل السياق التاريخي...'}
                      {activePhase === 'emotional' && 'رسم القوس العاطفي...'}
                      {activePhase === 'narrative' && 'تحديد البنية السردية...'}
                    </span>
                    <span className="text-sm text-gray-500">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} />
                </div>
              ) : (
                <Button onClick={runContextAnalysis} className="w-full">
                  <Brain className="w-4 h-4 ml-2" />
                  بدء التحليل العميق
                </Button>
              )}
            </div>
          ) : (
            <Tabs defaultValue="historical" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="historical">السياق التاريخي</TabsTrigger>
                <TabsTrigger value="emotional">القوس العاطفي</TabsTrigger>
                <TabsTrigger value="narrative">البنية السردية</TabsTrigger>
              </TabsList>

              <TabsContent value="historical" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
                    <Calendar className="w-4 h-4" />
                    <span>الفترة التاريخية</span>
                  </h4>
                  <p className="text-sm bg-blue-50 p-3 rounded">{analysis.historical_context.period}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
                    <Users className="w-4 h-4" />
                    <span>الشخصيات الرئيسية</span>
                  </h4>
                  <div className="space-y-2">
                    {analysis.historical_context.key_figures.map((figure, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium">{figure.name}</h5>
                          <Badge variant={
                            figure.relationship_type === 'ally' ? 'default' :
                            figure.relationship_type === 'enemy' ? 'destructive' : 'secondary'
                          }>
                            {figure.relationship_type === 'ally' ? 'حليف' :
                             figure.relationship_type === 'enemy' ? 'خصم' : 'محايد'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{figure.role}</p>
                        <p className="text-xs text-gray-500">{figure.significance}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4" />
                    <span>الأماكن المهمة</span>
                  </h4>
                  <div className="space-y-2">
                    {analysis.historical_context.locations.map((location, index) => (
                      <div key={index} className="border rounded p-3">
                        <h5 className="font-medium mb-1">{location.name}</h5>
                        <p className="text-sm text-gray-600 mb-1">{location.historical_significance}</p>
                        <p className="text-xs text-purple-600 italic">{location.symbolic_meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="emotional" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
                    <Heart className="w-4 h-4" />
                    <span>المشاعر المهيمنة</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.emotional_arc.dominant_emotions.map((emotion, index) => (
                      <Badge key={index} variant="outline">{emotion}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
                    <TrendingUp className="w-4 h-4" />
                    <span>القمم العاطفية</span>
                  </h4>
                  <div className="space-y-2">
                    {analysis.emotional_arc.emotional_peaks.map((peak, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium">{peak.moment}</h5>
                          <Badge>{peak.emotion}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{peak.significance}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">الخط الزمني العاطفي</h4>
                  <div className="space-y-2">
                    {analysis.emotional_arc.sentiment_timeline.map((point, index) => (
                      <div key={index} className="flex items-center space-x-3 space-x-reverse">
                        <span className="text-xs text-gray-500 w-16">{point.timestamp}</span>
                        <Badge variant="outline">{point.emotion}</Badge>
                        <div className="flex-1">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${point.intensity * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">{point.context}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="narrative" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
                    <Lightbulb className="w-4 h-4" />
                    <span>نقاط التحول الرئيسية</span>
                  </h4>
                  <div className="space-y-2">
                    {analysis.narrative_structure.turning_points.map((point, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium">{point.event}</h5>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <span className="text-xs text-gray-500">الوزن الدرامي:</span>
                            <Badge>{Math.round(point.dramatic_weight * 100)}%</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{point.impact}</p>
                        <span className="text-xs text-gray-500">{point.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
                    <BookOpen className="w-4 h-4" />
                    <span>تطور الشخصية</span>
                  </h4>
                  <div className="space-y-2">
                    {analysis.narrative_structure.character_development.map((stage, index) => (
                      <div key={index} className="border rounded p-3">
                        <h5 className="font-medium mb-1">{stage.stage}</h5>
                        <p className="text-sm text-gray-600 mb-1">{stage.description}</p>
                        <p className="text-xs text-purple-600 italic">{stage.psychological_state}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">المواضيع الرئيسية</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.narrative_structure.themes.map((theme, index) => (
                      <Badge key={index} variant="secondary">{theme}</Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
