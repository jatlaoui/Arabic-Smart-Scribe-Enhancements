
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Calendar,
  Copy,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  events: Array<{
    title: string;
    description: string;
    significance_level: number;
  }>;
  characters: Array<{
    name: string;
    role: string;
    traits: string[];
  }>;
  dialogues: Array<{
    speaker: string;
    content: string;
    literary_value: number;
  }>;
}

interface WitnessIntegratorProps {
  analysisResult: AnalysisResult;
  currentText?: string;
  onIntegrationComplete: (enhancedText: string) => void;
}

export const WitnessIntegrator: React.FC<WitnessIntegratorProps> = ({
  analysisResult,
  currentText = '',
  onIntegrationComplete
}) => {
  const [selectedElements, setSelectedElements] = useState<{
    events: number[];
    characters: number[];
    dialogues: number[];
  }>({
    events: [],
    characters: [],
    dialogues: []
  });
  const [integrationType, setIntegrationType] = useState<'merge' | 'scene' | 'chapter'>('merge');
  const [isIntegrating, setIsIntegrating] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');
  const { toast } = useToast();

  const toggleElement = (type: 'events' | 'characters' | 'dialogues', index: number) => {
    setSelectedElements(prev => ({
      ...prev,
      [type]: prev[type].includes(index)
        ? prev[type].filter(i => i !== index)
        : [...prev[type], index]
    }));
  };

  const selectAll = (type: 'events' | 'characters' | 'dialogues') => {
    const maxIndex = analysisResult[type].length;
    setSelectedElements(prev => ({
      ...prev,
      [type]: Array.from({ length: maxIndex }, (_, i) => i)
    }));
  };

  const clearSelection = (type: 'events' | 'characters' | 'dialogues') => {
    setSelectedElements(prev => ({
      ...prev,
      [type]: []
    }));
  };

  const startIntegration = async () => {
    const totalSelected = selectedElements.events.length + 
                         selectedElements.characters.length + 
                         selectedElements.dialogues.length;
    
    if (totalSelected === 0) {
      toast({
        title: "لم يتم تحديد عناصر",
        description: "يرجى تحديد العناصر التي تريد دمجها",
        variant: "destructive"
      });
      return;
    }

    setIsIntegrating(true);

    try {
      // محاكاة عملية الدمج
      await new Promise(resolve => setTimeout(resolve, 3000));

      // إنشاء نص محسن مع العناصر المحددة
      let enhanced = currentText || "بداية النص الجديد...\n\n";

      // إضافة الأحداث المحددة
      if (selectedElements.events.length > 0) {
        enhanced += "=== الأحداث المدمجة من الشهادة ===\n\n";
        selectedElements.events.forEach(index => {
          const event = analysisResult.events[index];
          enhanced += `**${event.title}**\n${event.description}\n\n`;
        });
      }

      // إضافة الشخصيات المحددة
      if (selectedElements.characters.length > 0) {
        enhanced += "=== الشخصيات المدمجة ===\n\n";
        selectedElements.characters.forEach(index => {
          const character = analysisResult.characters[index];
          enhanced += `**${character.name}** - ${character.role}\n`;
          enhanced += `الصفات: ${character.traits.join(', ')}\n\n`;
        });
      }

      // إضافة الحوارات المحددة
      if (selectedElements.dialogues.length > 0) {
        enhanced += "=== الحوارات المدمجة ===\n\n";
        selectedElements.dialogues.forEach(index => {
          const dialogue = analysisResult.dialogues[index];
          enhanced += `**${dialogue.speaker}**: "${dialogue.content}"\n\n`;
        });
      }

      setEnhancedText(enhanced);
      onIntegrationComplete(enhanced);

      toast({
        title: "تم الدمج بنجاح",
        description: `تم دمج ${totalSelected} عنصر من الشهادة في النص`
      });

    } catch (error) {
      toast({
        title: "خطأ في الدمج",
        description: "حدث خطأ أثناء دمج العناصر",
        variant: "destructive"
      });
    } finally {
      setIsIntegrating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(enhancedText);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص المحسن إلى الحافظة"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Wand2 className="w-5 h-5" />
            <span>دمج عناصر الشهادة في النص</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              variant={integrationType === 'merge' ? 'default' : 'outline'}
              onClick={() => setIntegrationType('merge')}
              className="h-16 flex flex-col space-y-1"
            >
              <BookOpen className="w-6 h-6" />
              <span>دمج مباشر</span>
            </Button>
            <Button
              variant={integrationType === 'scene' ? 'default' : 'outline'}
              onClick={() => setIntegrationType('scene')}
              className="h-16 flex flex-col space-y-1"
            >
              <Calendar className="w-6 h-6" />
              <span>مشهد جديد</span>
            </Button>
            <Button
              variant={integrationType === 'chapter' ? 'default' : 'outline'}
              onClick={() => setIntegrationType('chapter')}
              className="h-16 flex flex-col space-y-1"
            >
              <Users className="w-6 h-6" />
              <span>فصل منفصل</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الأحداث */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2 space-x-reverse">
                <Calendar className="w-4 h-4" />
                <span>الأحداث ({analysisResult.events.length})</span>
              </span>
              <div className="flex space-x-1 space-x-reverse">
                <Button size="sm" variant="ghost" onClick={() => selectAll('events')}>
                  كل شيء
                </Button>
                <Button size="sm" variant="ghost" onClick={() => clearSelection('events')}>
                  إلغاء
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisResult.events.map((event, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedElements.events.includes(index)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleElement('events', index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{event.title}</div>
                    {selectedElements.events.includes(index) && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    أهمية: {Math.round(event.significance_level * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الشخصيات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2 space-x-reverse">
                <Users className="w-4 h-4" />
                <span>الشخصيات ({analysisResult.characters.length})</span>
              </span>
              <div className="flex space-x-1 space-x-reverse">
                <Button size="sm" variant="ghost" onClick={() => selectAll('characters')}>
                  كل شيء
                </Button>
                <Button size="sm" variant="ghost" onClick={() => clearSelection('characters')}>
                  إلغاء
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisResult.characters.map((character, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedElements.characters.includes(index)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleElement('characters', index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{character.name}</div>
                    {selectedElements.characters.includes(index) && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{character.role}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {character.traits.slice(0, 2).map((trait, i) => (
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
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2 space-x-reverse">
                <MessageSquare className="w-4 h-4" />
                <span>الحوارات ({analysisResult.dialogues.length})</span>
              </span>
              <div className="flex space-x-1 space-x-reverse">
                <Button size="sm" variant="ghost" onClick={() => selectAll('dialogues')}>
                  كل شيء
                </Button>
                <Button size="sm" variant="ghost" onClick={() => clearSelection('dialogues')}>
                  إلغاء
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisResult.dialogues.map((dialogue, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedElements.dialogues.includes(index)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleElement('dialogues', index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{dialogue.speaker}</div>
                    {selectedElements.dialogues.includes(index) && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 italic">
                    "{dialogue.content.substring(0, 50)}..."
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    قيمة أدبية: {Math.round(dialogue.literary_value * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار العمل */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              المحدد: {selectedElements.events.length + selectedElements.characters.length + selectedElements.dialogues.length} عنصر
            </div>
            <Button 
              onClick={startIntegration}
              disabled={isIntegrating}
              className="min-w-32"
            >
              {isIntegrating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  جاري الدمج...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 ml-2" />
                  دمج العناصر
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* النص المحسن */}
      {enhancedText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>النص المحسن</span>
              <Button size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 ml-2" />
                نسخ النص
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={enhancedText}
              onChange={(e) => setEnhancedText(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
