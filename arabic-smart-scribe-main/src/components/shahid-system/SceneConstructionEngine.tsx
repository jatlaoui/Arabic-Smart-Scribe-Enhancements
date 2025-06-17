
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wand2, 
  BookOpen, 
  Users, 
  MapPin,
  Clock,
  Heart,
  Zap,
  Eye,
  Sparkles,
  Brain
} from 'lucide-react';

interface Scene {
  id: string;
  title: string;
  narrative_flow: string;
  characters_involved: string[];
  setting: {
    location: string;
    time: string;
    atmosphere: string;
  };
  emotional_tone: string;
  dramatic_weight: number;
  literary_devices: string[];
  sensory_integration: string[];
  internal_monologue: string[];
}

interface SceneConstructionEngineProps {
  witnessStatement: string;
  historicalContext: any;
  emotionalContext: any;
  sensoryDetails?: any[];
  metaphors?: any[];
  internalThoughts?: any[];
  onSceneGenerated: (scene: Scene) => void;
}

export const SceneConstructionEngine: React.FC<SceneConstructionEngineProps> = ({
  witnessStatement,
  historicalContext,
  emotionalContext,
  sensoryDetails = [],
  metaphors = [],
  internalThoughts = [],
  onSceneGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [sceneStyle, setSceneStyle] = useState<'realistic' | 'poetic' | 'dramatic'>('realistic');
  const [currentStep, setCurrentStep] = useState<'setup' | 'analysis' | 'writing' | 'enhancement'>('setup');

  const potentialEvents = [
    "قرار الانضمام للمقاومة",
    "اللقاء الأول مع لزهر الشرايطي", 
    "أول عملية عسكرية",
    "كمين السكة الحديدية",
    "اكتشاف الخيانة",
    "معركة الجبل الكبرى",
    "استشهاد الرفاق",
    "لحظة النصر النهائي"
  ];

  const generateScene = async () => {
    if (!selectedEvent) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentStep('analysis');

    // مرحلة التحليل
    for (let i = 0; i <= 25; i += 5) {
      setGenerationProgress(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setCurrentStep('writing');
    // مرحلة الكتابة
    for (let i = 25; i <= 70; i += 5) {
      setGenerationProgress(i);
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setCurrentStep('enhancement');
    // مرحلة التعزيز
    for (let i = 70; i <= 100; i += 5) {
      setGenerationProgress(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // توليد المشهد الأدبي المعزز
    const scene: Scene = {
      id: Date.now().toString(),
      title: selectedEvent,
      narrative_flow: generateNarrativeFlow(selectedEvent, sceneStyle),
      characters_involved: getCharactersForEvent(selectedEvent),
      setting: getSettingForEvent(selectedEvent),
      emotional_tone: getEmotionalTone(selectedEvent),
      dramatic_weight: getDramaticWeight(selectedEvent),
      literary_devices: getLiteraryDevices(selectedEvent, sceneStyle),
      sensory_integration: integrateSensoryDetails(selectedEvent),
      internal_monologue: integrateInternalThoughts(selectedEvent)
    };

    onSceneGenerated(scene);
    setIsGenerating(false);
    setCurrentStep('setup');
  };

  const generateNarrativeFlow = (event: string, style: string): string => {
    const baseNarratives = {
      "قرار الانضمام للمقاومة": {
        realistic: "في ليلة باردة من شتاء 1952، جلس حمادي غرس في غرفته الصغيرة، والقمر يرسل خيوطه الفضية عبر النافذة المشققة. كان القرار ينضج في قلبه منذ أسابيع، لكن هذه الليلة كانت مختلفة. صوت والده وهو يتحدث عن الكرامة المفقودة، ونظرات الجنود الفرنسيين المتعالية في الشارع، كل ذلك تجمع في لحظة واحدة حاسمة.",
        poetic: "كما يختار النهر مجراه عبر الصخور الصماء، اختار حمادي طريقه نحو الجبل. في قلبه كانت تتصارع عاصفتان: حب الأرض التي ولد عليها، وحب الأرض التي يحلم أن تولد حرة. والليل، ذلك الشاهد الصامت على قرارات التاريخ، كان يحتضن خطواته الأولى نحو المجهول.",
        dramatic: "توقف صوت الساعة عن الدق. في تلك اللحظة بالذات، وقف حمادي غرس أمام المرآة المكسورة وأقسم بدم أجداده أنه لن يعيش راكعاً. الكلمات خرجت من شفتيه كالرصاص: 'سأذهب إلى الجبل'. والمرآة، كما لو أنها تفهم ثقل القرار، انشقت شقاً جديداً."
      }
    };

    return baseNarratives[event as keyof typeof baseNarratives]?.[style] || 
           "مشهد أدبي معقد يحتاج إلى مزيد من التطوير...";
  };

  const getCharactersForEvent = (event: string): string[] => {
    const eventCharacters = {
      "قرار الانضمام للمقاومة": ["حمادي غرس", "الوالد", "الأم"],
      "اللقاء الأول مع لزهر الشرايطي": ["حمادي غرس", "لزهر الشرايطي", "المقاتلون"],
      "كمين السكة الحديدية": ["حمادي غرس", "لزهر الشرايطي", "المجموعة", "الجنود الفرنسيون"]
    };
    return eventCharacters[event as keyof typeof eventCharacters] || ["حمادي غرس"];
  };

  const getSettingForEvent = (event: string) => {
    const eventSettings = {
      "قرار الانضمام للمقاومة": {
        location: "البيت العائلي في الحي الشعبي",
        time: "ليلة شتوية 1952",
        atmosphere: "توتر وترقب"
      },
      "كمين السكة الحديدية": {
        location: "بالقرب من خط السكة الحديدية في الضواحي",
        time: "فجر بارد",
        atmosphere: "توتر قتالي ويقظة حادة"
      }
    };
    return eventSettings[event as keyof typeof eventSettings] || {
      location: "موقع غير محدد",
      time: "وقت غير محدد", 
      atmosphere: "مشاعر مختلطة"
    };
  };

  const getEmotionalTone = (event: string): string => {
    const tones = {
      "قرار الانضمام للمقاومة": "عزيمة مختلطة بالقلق",
      "كمين السكة الحديدية": "توتر وترقب",
      "استشهاد الرفاق": "حزن عميق وغضب"
    };
    return tones[event as keyof typeof tones] || "مشاعر متنوعة";
  };

  const getDramaticWeight = (event: string): number => {
    const weights = {
      "قرار الانضمام للمقاومة": 0.9,
      "كمين السكة الحديدية": 0.85,
      "استشهاد الرفاق": 0.95,
      "لحظة النصر النهائي": 0.88
    };
    return weights[event as keyof typeof weights] || 0.7;
  };

  const getLiteraryDevices = (event: string, style: string): string[] => {
    const baseDevices = ["الاستعارة", "التشبيه", "الوصف الحسي"];
    if (style === 'poetic') {
      return [...baseDevices, "الجناس", "السجع", "التكرار"];
    } else if (style === 'dramatic') {
      return [...baseDevices, "الحوار الداخلي", "التوتر المتصاعد", "النهاية المفتوحة"];
    }
    return baseDevices;
  };

  const integrateSensoryDetails = (event: string): string[] => {
    return sensoryDetails
      .filter(detail => detail.context.includes(event) || Math.random() > 0.5)
      .map(detail => detail.description)
      .slice(0, 3);
  };

  const integrateInternalThoughts = (event: string): string[] => {
    return internalThoughts
      .filter(thought => thought.trigger_event.includes(event) || Math.random() > 0.6)
      .map(thought => thought.thought)
      .slice(0, 2);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'analysis': return <Brain className="w-4 h-4" />;
      case 'writing': return <BookOpen className="w-4 h-4" />;
      case 'enhancement': return <Sparkles className="w-4 h-4" />;
      default: return <Wand2 className="w-4 h-4" />;
    }
  };

  const getStepTitle = (step: string) => {
    switch (step) {
      case 'analysis': return 'تحليل الحدث والسياق';
      case 'writing': return 'كتابة المشهد الأدبي';
      case 'enhancement': return 'تعزيز بالتفاصيل والاستعارات';
      default: return 'إعداد المشهد';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Wand2 className="w-6 h-6 text-green-600" />
          <span>محرك بناء المشاهد الأدبية</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          تحويل الأحداث التاريخية إلى مشاهد أدبية غنية بالتفاصيل والعمق النفسي
        </p>
      </CardHeader>
      <CardContent>
        {!isGenerating ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">اختر الحدث للتحويل</label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حدثاً من الشهادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {potentialEvents.map((event) => (
                      <SelectItem key={event} value={event}>{event}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">أسلوب الكتابة</label>
                <Select value={sceneStyle} onValueChange={(value: 'realistic' | 'poetic' | 'dramatic') => setSceneStyle(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">واقعي</SelectItem>
                    <SelectItem value="poetic">شاعري</SelectItem>
                    <SelectItem value="dramatic">درامي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* إحصائيات المحتوى المتاح */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 space-x-reverse mb-1">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">التفاصيل الحسية</span>
                </div>
                <Badge variant="secondary">{sensoryDetails.length}</Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 space-x-reverse mb-1">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">الاستعارات</span>
                </div>
                <Badge variant="secondary">{metaphors.length}</Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 space-x-reverse mb-1">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium">الأفكار الداخلية</span>
                </div>
                <Badge variant="secondary">{internalThoughts.length}</Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 space-x-reverse mb-1">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">السياق التاريخي</span>
                </div>
                <Badge variant="secondary">متوفر</Badge>
              </div>
            </div>

            <Button 
              onClick={generateScene} 
              disabled={!selectedEvent}
              className="w-full"
              size="lg"
            >
              <Wand2 className="w-5 h-5 ml-2" />
              تحويل إلى مشهد أدبي
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                {getStepIcon(currentStep)}
                <span className="font-medium">{getStepTitle(currentStep)}</span>
              </div>
              <span className="text-sm text-gray-600">{generationProgress}%</span>
            </div>
            
            <Progress value={generationProgress} className="w-full" />
            
            <div className="text-sm text-gray-600 text-center">
              جاري بناء مشهد: "{selectedEvent}" بأسلوب {sceneStyle === 'realistic' ? 'واقعي' : sceneStyle === 'poetic' ? 'شاعري' : 'درامي'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
