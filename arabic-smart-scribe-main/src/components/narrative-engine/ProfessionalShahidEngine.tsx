import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Users, MapPin, Heart, BookOpen, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import SeriesPlanner from './SeriesPlanner';
import SeriesOutlineViewer from './SeriesOutlineViewer';

interface KnowledgeBase {
  id: string;
  entities: any[];
  characters: any[];
  places: any[];
  events: any[];
  emotional_arc: any;
  themes: string[];
  conflicts: string[];
}

interface CreativeLayers {
  sensory_details: Record<string, any[]>;
  metaphors: any[];
  internal_monologues: Record<string, any[]>;
}

export const ProfessionalShahidEngine: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);
  const [inputText, setInputText] = useState<string>('');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [creativeLayers, setCreativeLayers] = useState<CreativeLayers | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Scene Generation State
  const [sceneRequest, setSceneRequest] = useState({
    scene_type: 'dialogue',
    main_characters: [],
    setting: '',
    conflict: '',
    emotional_tone: '',
    length: 'medium'
  });
  const [generatedScene, setGeneratedScene] = useState<string>('');
  const [constructionMode, setConstructionMode] = useState<'novel' | 'screenplay' | null>(null);
  const [seriesPlan, setSeriesPlan] = useState<any | null>(null);
  const [constructionMode, setConstructionMode] = useState<'novel' | 'screenplay' | null>(null);

  const handlePhaseOne = async () => {
    setIsProcessing(true);
    setAnalysisProgress(0);
    
    try {
      // المرحلة الأولى: التحليل المعماري
      const analysisResponse = await apiClient.post('/api/shahid/architectural-analysis', {
        text: inputText
      });
      
      setAnalysisProgress(50);
      
      if (analysisResponse.data.success) {
        setKnowledgeBase(analysisResponse.data.knowledge_base);
        setAnalysisProgress(100);
        setCurrentPhase(2);
      }
    } catch (error) {
      console.error('خطأ في التحليل المعماري:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhaseTwo = async () => {
    if (!knowledgeBase) return;
    
    setIsProcessing(true);
    
    try {
      // المرحلة الثانية: التوليد الإبداعي
      const creativeResponse = await apiClient.post('/api/shahid/creative-generation', {
        knowledge_base_id: knowledgeBase.id
      });
      
      if (creativeResponse.data.success) {
        setCreativeLayers(creativeResponse.data.creative_layers);
        setCurrentPhase(3);
      }
    } catch (error) {
      console.error('خطأ في التوليد الإبداعي:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSceneGeneration = async () => {
    if (!knowledgeBase || !creativeLayers) return;
    
    setIsProcessing(true);
    
    try {
      const sceneResponse = await apiClient.post('/api/shahid/generate-scene', {
        knowledge_base_id: knowledgeBase.id,
        creative_layers: creativeLayers,
        scene_request: sceneRequest
      });
      
      if (sceneResponse.data.success) {
        setGeneratedScene(sceneResponse.data.scene.content);
      }
    } catch (error) {
      console.error('خطأ في توليد المشهد:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            الشاهد الاحترافي - المحرك الروائي المتكامل
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Phase Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 ${currentPhase >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPhase >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
                  1
                </div>
                <span>التحليل المعماري</span>
              </div>
              
              <div className={`flex items-center gap-2 ${currentPhase >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPhase >= 2 ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                  2
                </div>
                <span>التوليد الإبداعي</span>
              </div>
              
              <div className={`flex items-center gap-2 ${currentPhase >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPhase >= 3 ? 'bg-purple-100 text-purple-600' : 'bg-gray-100'}`}>
                  3
                </div>
                <span>البناء السردي</span>
              </div>
            </div>
            
            {isProcessing && (
              <Progress value={analysisProgress} className="w-full" />
            )}
          </div>

          <Tabs value={currentPhase.toString()} className="w-full">
            {/* المرحلة الأولى */}
            <TabsContent value="1" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  المرحلة الأولى: التحليل المعماري وتأسيس المعرفة
                </h3>
                
                <Textarea
                  placeholder="أدخل النص المراد تحليله (شهادة، مقابلة، نص تاريخي...)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px]"
                />
                
                <Button 
                  onClick={handlePhaseOne}
                  disabled={!inputText || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'جاري التحليل المعماري...' : 'بدء التحليل المعماري'}
                </Button>
                
                {knowledgeBase && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium">نتائج التحليل:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold">{knowledgeBase.characters.length}</div>
                          <div className="text-sm text-gray-600">شخصية</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <MapPin className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <div className="text-2xl font-bold">{knowledgeBase.places.length}</div>
                          <div className="text-sm text-gray-600">مكان</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                          <div className="text-2xl font-bold">{knowledgeBase.events.length}</div>
                          <div className="text-sm text-gray-600">حدث</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-2xl font-bold">{knowledgeBase.themes.length}</div>
                          <div className="text-sm text-gray-600">ثيمة</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium">الثيمات المستخرجة:</h5>
                      <div className="flex flex-wrap gap-2">
                        {knowledgeBase.themes.map((theme, index) => (
                          <Badge key={index} variant="secondary">{theme}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button onClick={() => setCurrentPhase(2)} className="w-full">
                      الانتقال للمرحلة الثانية: التوليد الإبداعي
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* المرحلة الثانية */}
            <TabsContent value="2" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">المرحلة الثانية: التوليد الإبداعي للطبقات السردية</h3>
                
                <p className="text-gray-600">
                  في هذه المرحلة سيتم توليد التفاصيل الحسية، الاستعارات، والحوارات الداخلية بناءً على التحليل المعماري.
                </p>
                
                <Button 
                  onClick={handlePhaseTwo}
                  disabled={!knowledgeBase || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'جاري التوليد الإبداعي...' : 'بدء التوليد الإبداعي'}
                </Button>
                
                {creativeLayers && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium">الطبقات الإبداعية المولدة:</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-2">التفاصيل الحسية</h5>
                          <p className="text-sm text-gray-600">
                            {Object.keys(creativeLayers.sensory_details).length} مكان مع تفاصيل حسية غنية
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-2">الاستعارات</h5>
                          <p className="text-sm text-gray-600">
                            {creativeLayers.metaphors.length} استعارة ورمزية
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-2">الحوارات الداخلية</h5>
                          <p className="text-sm text-gray-600">
                            {Object.keys(creativeLayers.internal_monologues).length} شخصية مع حوارات داخلية
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button onClick={() => setCurrentPhase(3)} className="w-full">
                      الانتقال للمرحلة الثالثة: البناء السردي
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* المرحلة الثالثة */}
            <TabsContent value="3" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">المرحلة الثالثة: البناء السردي الآلي</h3>
                

      {!constructionMode && (
        <div className="flex flex-col md:flex-row gap-4 my-6 justify-center">
          <Button onClick={ () => setConstructionMode('novel') } variant="outline" className="flex-1 py-6 text-lg">
            <span className="mr-2">📚</span> توليد رواية
          </Button>
          <Button onClick={ () => { setConstructionMode('screenplay'); console.log('Screenplay mode selected - SeriesPlanner should load here.'); alert('Screenplay mode selected! Next step: Series Planner.'); } } variant="outline" className="flex-1 py-6 text-lg">
            <span className="mr-2">🎬</span> توليد سيناريو مسلسل
          </Button>
        </div>
      )}

      {constructionMode === 'novel' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">نوع المشهد</label>
                      <Select value={sceneRequest.scene_type} onValueChange={(value) => 
                        setSceneRequest(prev => ({ ...prev, scene_type: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع المشهد" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dialogue">حوار</SelectItem>
                          <SelectItem value="action">حدث/أكشن</SelectItem>
                          <SelectItem value="reflection">تأمل</SelectItem>
                          <SelectItem value="flashback">استرجاع</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">المكان</label>
                      <Select value={sceneRequest.setting} onValueChange={(value) => 
                        setSceneRequest(prev => ({ ...prev, setting: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المكان" />
                        </SelectTrigger>
                        <SelectContent>
                          {knowledgeBase?.places.map((place, index) => (
                            <SelectItem key={index} value={place.name}>{place.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">النبرة العاطفية</label>
                      <Select value={sceneRequest.emotional_tone} onValueChange={(value) => 
                        setSceneRequest(prev => ({ ...prev, emotional_tone: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر النبرة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nostalgic">حنين</SelectItem>
                          <SelectItem value="tense">توتر</SelectItem>
                          <SelectItem value="hopeful">أمل</SelectItem>
                          <SelectItem value="melancholic">حزن</SelectItem>
                          <SelectItem value="determined">عزم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الصراع المحوري</label>
                      <Textarea
                        placeholder="وصف موجز للصراع في المشهد..."
                        value={sceneRequest.conflict}
                        onChange={(e) => setSceneRequest(prev => ({ ...prev, conflict: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSceneGeneration}
                  disabled={!sceneRequest.setting || !sceneRequest.conflict || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'جاري توليد المشهد...' : 'توليد المشهد الروائي'}
                </Button>
                
                {generatedScene && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">المشهد المولد:</h4>
                    <Card>
                      <CardContent className="p-6">
                        <div className="prose prose-arabic max-w-none" dir="rtl">
                          <div className="whitespace-pre-wrap">{generatedScene}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
        </>
      )}

      {constructionMode === 'screenplay' && (
      <>
        {!seriesPlan ? (

        <div className="p-6 border rounded-md bg-gray-50">
          <h4 className="text-xl font-semibold mb-4 text-center">🎬 وضع تخطيط المسلسل</h4>
          <p className="text-center text-gray-700">
            سيتم هنا عرض مخطط المسلسل (SeriesPlanner.tsx) لتحديد عدد الحلقات ومدتها.
          </p>

            <SeriesPlanner
              projectId={knowledgeBase?.id || "temp-project-id"}
              onSeriesPlanSubmitted={(planData) => {
                console.log("Series Plan Submitted:", planData);
                setSeriesPlan(planData);
                alert("مخطط المسلسل جاهز للعرض!");
              }}
              onCancel={() => setConstructionMode(null
        ) : (
          <SeriesOutlineViewer
            outlineData={seriesPlan}
            onGoBackToPlanner={() => {
              setSeriesPlan(null);
            }}
          />
        )}
      </>
    )}
            />
          <Button onClick={() => setConstructionMode(null)} variant="link" className="mt-4">
            العودة لاختيار المسار
          </Button>
        </div>
      )}

            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
