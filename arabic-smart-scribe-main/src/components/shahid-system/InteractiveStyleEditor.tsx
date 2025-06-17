
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Wand2, 
  Heart, 
  Zap, 
  Eye, 
  Mic,
  Brain,
  Feather,
  Mountain,
  Sparkles
} from 'lucide-react';

interface StyleParams {
  tension_level: number;
  poetic_intensity: number;
  emotional_depth: number;
  dialogue_density: number;
  descriptive_richness: number;
  pace: 'slow' | 'medium' | 'fast';
  perspective: 'first' | 'third_limited' | 'omniscient';
  tone: 'realistic' | 'poetic' | 'cinematic' | 'intimate';
}

interface StyleSuggestion {
  type: 'tension' | 'poetry' | 'emotion' | 'dialogue' | 'description';
  suggestion: string;
  before: string;
  after: string;
  explanation: string;
}

interface InteractiveStyleEditorProps {
  selectedText: string;
  onTextChange: (newText: string) => void;
  onClose: () => void;
}

export const InteractiveStyleEditor: React.FC<InteractiveStyleEditorProps> = ({
  selectedText,
  onTextChange,
  onClose
}) => {
  const [styleParams, setStyleParams] = useState<StyleParams>({
    tension_level: 50,
    poetic_intensity: 30,
    emotional_depth: 40,
    dialogue_density: 20,
    descriptive_richness: 60,
    pace: 'medium',
    perspective: 'third_limited',
    tone: 'realistic'
  });

  const [editedText, setEditedText] = useState(selectedText);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<StyleSuggestion[]>([]);
  const [activeMode, setActiveMode] = useState<'quick' | 'advanced' | 'artistic'>('quick');

  const quickStyles = [
    {
      id: 'more_tension',
      name: 'المزيد من التوتر',
      icon: Zap,
      description: 'زيادة التشويق والإثارة',
      params: { tension_level: 80, pace: 'fast' as const }
    },
    {
      id: 'more_poetic',
      name: 'أكثر شاعرية',
      icon: Feather,
      description: 'إضافة لمسات شعرية وجمالية',
      params: { poetic_intensity: 80, descriptive_richness: 90 }
    },
    {
      id: 'deeper_emotion',
      name: 'عمق عاطفي أكبر',
      icon: Heart,
      description: 'تعميق المشاعر والحوار الداخلي',
      params: { emotional_depth: 90, dialogue_density: 60 }
    },
    {
      id: 'cinematic',
      name: 'سينمائي مشوق',
      icon: Eye,
      description: 'أسلوب سينمائي بصري',
      params: { descriptive_richness: 85, pace: 'fast' as const, tone: 'cinematic' as const }
    },
    {
      id: 'intimate',
      name: 'حميمي عاطفي',
      icon: Heart,
      description: 'تركيز على المشاعر الداخلية',
      params: { emotional_depth: 85, perspective: 'first' as const, tone: 'intimate' as const }
    },
    {
      id: 'epic',
      name: 'ملحمي فخم',
      icon: Mountain,
      description: 'أسلوب ملحمي مهيب',
      params: { descriptive_richness: 95, poetic_intensity: 70, pace: 'slow' as const }
    }
  ];

  const applyQuickStyle = async (style: any) => {
    setIsProcessing(true);
    
    try {
      // محاكاة معالجة النص
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // تطبيق التغييرات على المعاملات
      setStyleParams(prev => ({ ...prev, ...style.params }));
      
      // محاكاة النص المحرر
      let processedText = selectedText;
      
      if (style.id === 'more_tension') {
        processedText = selectedText.replace(/\./g, '... توقف قلبه للحظة.');
      } else if (style.id === 'more_poetic') {
        processedText = `كالطائر الذي يحلق في سماء الحرية، ${selectedText}`;
      } else if (style.id === 'deeper_emotion') {
        processedText = selectedText + '\n\nكان قلبه يتسارع، وذكريات الطفولة تتراقص أمام عينيه كأوراق شجر في مهب ريح الحنين.';
      }
      
      setEditedText(processedText);
      
      // إنشاء اقتراحات وهمية
      const mockSuggestions: StyleSuggestion[] = [
        {
          type: 'tension',
          suggestion: 'إضافة توقيت درامي',
          before: 'اقترب من الباب',
          after: 'اقترب من الباب... ثانية... ثانيتان... كان الصمت يصم الآذان',
          explanation: 'إضافة توقيت يزيد من التوتر'
        },
        {
          type: 'poetry',
          suggestion: 'استعارة شعرية',
          before: 'كان خائفاً',
          after: 'كان قلبه طائراً صغيراً يرفرف في قفص من الرعب',
          explanation: 'تحويل المشاعر إلى صور شعرية'
        }
      ];
      
      setSuggestions(mockSuggestions);
      
    } catch (error) {
      console.error('خطأ في معالجة النص:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyAdvancedEditing = async () => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // معالجة متقدمة بناءً على جميع المعاملات
      let processedText = selectedText;
      
      if (styleParams.tension_level > 70) {
        processedText = processedText.replace(/\./g, '...');
      }
      
      if (styleParams.poetic_intensity > 60) {
        processedText = `في لحظة من لحظات القدر التي تصنع التاريخ، ${processedText}`;
      }
      
      if (styleParams.emotional_depth > 70) {
        processedText += '\n\nشعر بأن روحه تتمزق بين الخوف والأمل، بين الماضي الذي يرفض أن يتركه والمستقبل الذي يناديه بصوت أجش.';
      }
      
      setEditedText(processedText);
      
    } catch (error) {
      console.error('خطأ في المعالجة المتقدمة:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Palette className="w-6 h-6 text-pink-600" />
              <span>محرر الأسلوب التفاعلي</span>
            </CardTitle>
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick">تحرير سريع</TabsTrigger>
              <TabsTrigger value="advanced">تحكم متقدم</TabsTrigger>
              <TabsTrigger value="artistic">الأسلوب الفني</TabsTrigger>
            </TabsList>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* النص الأصلي والمحرر */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">النص الأصلي:</label>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] text-sm">
                    {selectedText}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">النص المحرر:</label>
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-[200px]"
                    placeholder="النص المحرر سيظهر هنا..."
                  />
                </div>

                <div className="flex space-x-2 space-x-reverse">
                  <Button 
                    onClick={() => onTextChange(editedText)}
                    className="flex-1"
                  >
                    تطبيق التغييرات
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setEditedText(selectedText)}
                    className="flex-1"
                  >
                    إعادة تعيين
                  </Button>
                </div>
              </div>

              {/* أدوات التحرير */}
              <div>
                <TabsContent value="quick" className="space-y-4">
                  <h4 className="font-semibold">أساليب سريعة:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {quickStyles.map((style) => {
                      const IconComponent = style.icon;
                      return (
                        <Button
                          key={style.id}
                          variant="outline"
                          onClick={() => applyQuickStyle(style)}
                          disabled={isProcessing}
                          className="justify-start h-auto p-4"
                        >
                          <div className="flex items-center space-x-3 space-x-reverse w-full">
                            <IconComponent className="w-5 h-5" />
                            <div className="text-right flex-1">
                              <div className="font-medium">{style.name}</div>
                              <div className="text-xs text-gray-500">{style.description}</div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <h4 className="font-semibold">التحكم المتقدم:</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        مستوى التوتر: {styleParams.tension_level}%
                      </label>
                      <Slider
                        value={[styleParams.tension_level]}
                        onValueChange={([value]) => setStyleParams(prev => ({ ...prev, tension_level: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        الكثافة الشعرية: {styleParams.poetic_intensity}%
                      </label>
                      <Slider
                        value={[styleParams.poetic_intensity]}
                        onValueChange={([value]) => setStyleParams(prev => ({ ...prev, poetic_intensity: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        العمق العاطفي: {styleParams.emotional_depth}%
                      </label>
                      <Slider
                        value={[styleParams.emotional_depth]}
                        onValueChange={([value]) => setStyleParams(prev => ({ ...prev, emotional_depth: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        كثافة الحوار: {styleParams.dialogue_density}%
                      </label>
                      <Slider
                        value={[styleParams.dialogue_density]}
                        onValueChange={([value]) => setStyleParams(prev => ({ ...prev, dialogue_density: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        ثراء الوصف: {styleParams.descriptive_richness}%
                      </label>
                      <Slider
                        value={[styleParams.descriptive_richness]}
                        onValueChange={([value]) => setStyleParams(prev => ({ ...prev, descriptive_richness: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">الإيقاع:</label>
                        <select 
                          value={styleParams.pace}
                          onChange={(e) => setStyleParams(prev => ({ ...prev, pace: e.target.value as any }))}
                          className="w-full text-xs p-2 border rounded"
                        >
                          <option value="slow">بطيء</option>
                          <option value="medium">متوسط</option>
                          <option value="fast">سريع</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">المنظور:</label>
                        <select 
                          value={styleParams.perspective}
                          onChange={(e) => setStyleParams(prev => ({ ...prev, perspective: e.target.value as any }))}
                          className="w-full text-xs p-2 border rounded"
                        >
                          <option value="first">ضمير المتكلم</option>
                          <option value="third_limited">الغائب المحدود</option>
                          <option value="omniscient">الغائب العالم</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">النبرة:</label>
                        <select 
                          value={styleParams.tone}
                          onChange={(e) => setStyleParams(prev => ({ ...prev, tone: e.target.value as any }))}
                          className="w-full text-xs p-2 border rounded"
                        >
                          <option value="realistic">واقعي</option>
                          <option value="poetic">شعري</option>
                          <option value="cinematic">سينمائي</option>
                          <option value="intimate">حميمي</option>
                        </select>
                      </div>
                    </div>

                    <Button 
                      onClick={applyAdvancedEditing}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                          جاري المعالجة...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 ml-2" />
                          تطبيق التعديلات المتقدمة
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="artistic" className="space-y-4">
                  <h4 className="font-semibold">الاقتراحات الفنية:</h4>
                  
                  {suggestions.length > 0 ? (
                    <div className="space-y-3">
                      {suggestions.map((suggestion, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{suggestion.type}</Badge>
                            <Button size="sm" variant="ghost">
                              <Sparkles className="w-3 h-3" />
                            </Button>
                          </div>
                          <h5 className="font-medium text-sm mb-1">{suggestion.suggestion}</h5>
                          <div className="text-xs space-y-1">
                            <div className="bg-red-50 p-2 rounded">
                              <span className="text-red-600 font-medium">قبل:</span> {suggestion.before}
                            </div>
                            <div className="bg-green-50 p-2 rounded">
                              <span className="text-green-600 font-medium">بعد:</span> {suggestion.after}
                            </div>
                            <p className="text-gray-600 italic">{suggestion.explanation}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Brain className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>اختر أسلوباً سريعاً أو قم بالتحرير المتقدم لرؤية الاقتراحات الفنية</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
