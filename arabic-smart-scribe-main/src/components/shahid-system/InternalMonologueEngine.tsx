
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Heart, 
  MessageSquare,
  User,
  Clock,
  Zap
} from 'lucide-react';

interface InternalThought {
  character: string;
  emotion: 'conflict' | 'determination' | 'fear' | 'hope' | 'regret' | 'pride';
  thought: string;
  context: string;
  psychological_state: string;
  trigger_event: string;
}

interface InternalMonologueEngineProps {
  selectedText: string;
  characters: Array<{
    name: string;
    role: string;
    psychological_profile: string;
  }>;
  onMonologueGenerated: (thoughts: InternalThought[]) => void;
}

export const InternalMonologueEngine: React.FC<InternalMonologueEngineProps> = ({
  selectedText,
  characters,
  onMonologueGenerated
}) => {
  const [generatedThoughts, setGeneratedThoughts] = useState<InternalThought[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');

  const generateInternalMonologue = async () => {
    setIsGenerating(true);

    // محاكاة توليد الحوار الداخلي
    await new Promise(resolve => setTimeout(resolve, 2500));

    const thoughts: InternalThought[] = [
      {
        character: 'حمادي غرس',
        emotion: 'determination',
        thought: 'لا يمكنني التراجع الآن. كل خطوة أخطوها نحو الجبل هي خطوة نحو حرية تونس. والدي قال لي يوماً أن الرجل الحقيقي يختار طريقه ولا يندم عليه.',
        context: 'لحظة اتخاذ قرار الانضمام للمقاومة',
        psychological_state: 'عزم مختلط بالخوف الطبيعي',
        trigger_event: 'مغادرة البيت متوجهاً للجبل'
      },
      {
        character: 'حمادي غرس',
        emotion: 'conflict',
        thought: 'هل كان القرار صحيحاً؟ وجه أمي الحزين لا يفارق ذاكرتي. لكن كيف لي أن أعيش في سلام بينما وطني يذل؟ سأجعلها فخورة بي، سأعود لها بتونس حرة.',
        context: 'بعد أول ليلة في الجبل',
        psychological_state: 'صراع بين الواجب الوطني والعاطفة الأسرية',
        trigger_event: 'الاستيقاظ في الفجر وتذكر البيت'
      },
      {
        character: 'لزهر الشرايطي',
        emotion: 'pride',
        thought: 'هذا الشاب حمادي يذكرني بنفسي في شبابي. هناك نار في عينيه، نار الحرية. سأجعل منه مقاتلاً يُشار إليه بالبنان، لكن عليّ أن أعلمه أن الشجاعة ليست غياب الخوف، بل التغلب عليه.',
        context: 'مراقبة حمادي أثناء التدريب',
        psychological_state: 'فخر بالجيل الجديد ومسؤولية القيادة',
        trigger_event: 'رؤية حمادي ينجح في أول مهمة تدريبية'
      },
      {
        character: 'حمادي غرس',
        emotion: 'fear',
        thought: 'قلبي يخفق بشدة. أسمع خطوات الجنود تقترب. إذا قُبض علينا الآن، فكل شيء انتهى. لا، لن أسمح لهم بأن يدمروا أحلامنا. سأقاتل حتى النفس الأخير.',
        context: 'أثناء كمين للقوات الفرنسية',
        psychological_state: 'خوف مبرر مختلط بعزيمة قوية',
        trigger_event: 'سماع أصوات الدورية العسكرية'
      },
      {
        character: 'حمادي غرس',
        emotion: 'regret',
        thought: 'لو أنني كنت أسرع، لو أنني انتبهت للإشارة مبكراً... ربما كان رفيقي ما زال معنا. دمه على يدي، ولكن دمه لن يذهب هدراً. سأحمل روحه معي في كل معركة قادمة.',
        context: 'بعد فقدان رفيق في معركة',
        psychological_state: 'حزن عميق وشعور بالمسؤولية',
        trigger_event: 'رؤية جثة الرفيق'
      },
      {
        character: 'الأم',
        emotion: 'hope',
        thought: 'ابني في الجبل الآن، يقاتل من أجلنا جميعاً. أصلي كل ليلة أن يعود سالماً، وأصلي أيضاً أن يكون الثمن الذي ندفعه يستحق الحرية التي نحلم بها.',
        context: 'انتظار أخبار الابن',
        psychological_state: 'قلق الأمومة ممزوج بالفخر الوطني',
        trigger_event: 'سماع أخبار المقاومة في الراديو'
      }
    ];

    setGeneratedThoughts(thoughts);
    onMonologueGenerated(thoughts);
    setIsGenerating(false);
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'determination': return 'bg-blue-100 text-blue-800';
      case 'conflict': return 'bg-orange-100 text-orange-800';
      case 'fear': return 'bg-red-100 text-red-800';
      case 'hope': return 'bg-green-100 text-green-800';
      case 'regret': return 'bg-gray-100 text-gray-800';
      case 'pride': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmotionName = (emotion: string) => {
    switch (emotion) {
      case 'determination': return 'عزيمة';
      case 'conflict': return 'صراع';
      case 'fear': return 'خوف';
      case 'hope': return 'أمل';
      case 'regret': return 'ندم';
      case 'pride': return 'فخر';
      default: return 'مشاعر مختلطة';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Brain className="w-5 h-5 text-indigo-600" />
          <span>مولّد الحوار الداخلي</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          توليد الأفكار والمشاعر الداخلية للشخصيات بناءً على السياق النفسي والدرامي
        </p>
      </CardHeader>
      <CardContent>
        {selectedText && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium mb-1">النص المحدد:</h5>
            <p className="text-sm text-gray-700">"{selectedText}"</p>
          </div>
        )}

        {!generatedThoughts.length ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              سأقوم بتوليد حوار داخلي عميق للشخصيات يكشف عن صراعاتهم النفسية ودوافعهم
            </p>
            
            <Button 
              onClick={generateInternalMonologue} 
              disabled={isGenerating}
              className="w-full"
            >
              <MessageSquare className="w-4 h-4 ml-2" />
              {isGenerating ? 'توليد الحوار الداخلي...' : 'توليد الحوار الداخلي'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">الحوار الداخلي المولد</h4>
              <Badge variant="secondary">{generatedThoughts.length} فكرة</Badge>
            </div>

            <div className="space-y-4">
              {generatedThoughts.map((thought, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">{thought.character}</span>
                    </div>
                    <Badge className={getEmotionColor(thought.emotion)}>
                      <Heart className="w-3 h-3 ml-1" />
                      {getEmotionName(thought.emotion)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
                      <p className="text-gray-800 italic">"{thought.thought}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-blue-600 flex items-center space-x-1 space-x-reverse">
                          <Clock className="w-3 h-3" />
                          <span>السياق:</span>
                        </span>
                        <p className="text-gray-600">{thought.context}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-600 flex items-center space-x-1 space-x-reverse">
                          <Zap className="w-3 h-3" />
                          <span>المحفز:</span>
                        </span>
                        <p className="text-gray-600">{thought.trigger_event}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-purple-600 text-sm">الحالة النفسية: </span>
                      <span className="text-sm text-gray-600">{thought.psychological_state}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              onClick={generateInternalMonologue}
              className="w-full"
            >
              <Brain className="w-4 h-4 ml-2" />
              توليد أفكار إضافية
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
