
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Wand2, 
  Download, 
  Save,
  Eye,
  EyeOff,
  Lightbulb,
  MessageSquare,
  Users,
  Calendar,
  Palette,
  RefreshCw,
  Copy,
  Share,
  Settings
} from 'lucide-react';

interface AnalysisResult {
  events: any[];
  characters: any[];
  dialogues: any[];
  credibility_assessment: any;
}

interface SceneConstructorProps {
  selectedElements: any[];
  faithfulMode: boolean;
  analysisResult: AnalysisResult;
  onElementsChange: (elements: any[]) => void;
}

export const SceneConstructor: React.FC<SceneConstructorProps> = ({
  selectedElements,
  faithfulMode,
  analysisResult,
  onElementsChange
}) => {
  const [sceneText, setSceneText] = useState('');
  const [showInspirationPalette, setShowInspirationPalette] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleElementDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const elementData = JSON.parse(e.dataTransfer.getData('application/json'));
      insertElementIntoText(elementData);
    } catch (error) {
      console.error('خطأ في معالجة العنصر المسحوب:', error);
    }
  };

  const insertElementIntoText = (element: any) => {
    let insertText = '';
    
    switch (element.elementType) {
      case 'event':
        insertText = `\n\n**${element.title}**\n\n${element.description}\n\nفي ${element.location}، ${element.timeframe}، شهد ${element.participants.join(' و')} هذا الحدث المهم. ${element.original_excerpt}\n\n`;
        break;
      
      case 'character':
        insertText = `\n\n**${element.name}** - ${element.role}\n\n${element.traits.join('، ')}. ${element.quotes.length > 0 ? `قال: "${element.quotes[0]}"` : ''}\n\n`;
        break;
      
      case 'dialogue':
        insertText = `\n\n**${element.speaker}:** "${element.content}"\n\n*[السياق: ${element.context}]*\n\n`;
        break;
      
      default:
        insertText = `\n\n[عنصر غير معروف]\n\n`;
    }

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = sceneText.substring(0, start) + insertText + sceneText.substring(end);
      setSceneText(newText);
      
      // تحديث موضع المؤشر
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
        textarea.focus();
      }, 0);
    }
  };

  const generateContextualNarrative = async () => {
    setIsGenerating(true);
    
    // محاكاة استدعاء API للذكاء الاصطناعي
    setTimeout(() => {
      const suggestions = [
        'كانت الريح تعصف بقوة في ذلك اليوم، حاملة معها رائحة التراب المبلل والذكريات العتيقة...',
        'تلاقت أعينهم في صمت محمل بالمعاني، كل منهم يحمل في قلبه قصة لم ترو بعد...',
        'بين جدران المكان العتيق، كانت أصداء الماضي تتردد كموسيقى حزينة تحكي قصص الأجيال...',
        'في تلك اللحظة، توقف الزمن كما لو أن الكون نفسه يصغي لهذه الشهادة المؤثرة...'
      ];
      
      setGeneratedSuggestions(suggestions);
      setIsGenerating(false);
    }, 2000);
  };

  const applySuggestion = (suggestion: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const newText = sceneText.substring(0, start) + suggestion + sceneText.substring(start);
      setSceneText(newText);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + suggestion.length;
        textarea.focus();
      }, 0);
    }
  };

  const removeElement = (index: number) => {
    const newElements = selectedElements.filter((_, i) => i !== index);
    onElementsChange(newElements);
  };

  const getElementIcon = (elementType: string) => {
    switch (elementType) {
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'character': return <Users className="w-4 h-4" />;
      case 'dialogue': return <MessageSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getElementColor = (elementType: string) => {
    switch (elementType) {
      case 'event': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'character': return 'bg-green-100 text-green-800 border-green-300';
      case 'dialogue': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const exportScene = () => {
    const exportData = {
      title: 'مشهد مولد من الشاهد',
      content: sceneText,
      elements: selectedElements,
      faithfulMode,
      timestamp: new Date().toISOString(),
      metadata: {
        wordCount: sceneText.split(' ').length,
        elementsUsed: selectedElements.length
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      
      {/* لوحة الإلهام */}
      <div className={`space-y-4 transition-all duration-300 ${showInspirationPalette ? 'lg:col-span-1' : 'hidden lg:block lg:w-12'}`}>
        <Card className="h-full">
          <CardHeader className="sticky top-0 bg-white z-10 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2 space-x-reverse">
                <Palette className="w-5 h-5" />
                <span>لوحة الإلهام</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInspirationPalette(!showInspirationPalette)}
              >
                {showInspirationPalette ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 space-y-4 overflow-y-auto">
            {/* العناصر المحددة */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                <Lightbulb className="w-4 h-4" />
                <span>العناصر المحددة ({selectedElements.length})</span>
              </h3>
              
              <div className="space-y-2">
                {selectedElements.map((element, index) => (
                  <div
                    key={`${element.id}-${index}`}
                    className={`p-3 rounded-lg border cursor-grab transition-all hover:shadow-md ${getElementColor(element.elementType)}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(element));
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {getElementIcon(element.elementType)}
                        <span className="font-medium text-sm">
                          {element.title || element.name || element.speaker}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeElement(index)}
                        className="h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <p className="text-xs opacity-75 line-clamp-2">
                      {element.description || element.role || element.content}
                    </p>
                    
                    <Badge variant="outline" className="mt-2 text-xs">
                      {element.elementType === 'event' ? 'حدث' :
                       element.elementType === 'character' ? 'شخصية' :
                       element.elementType === 'dialogue' ? 'حوار' : 'عنصر'}
                    </Badge>
                  </div>
                ))}
                
                {selectedElements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">لم يتم تحديد أي عناصر بعد</p>
                    <p className="text-xs mt-1">اسحب العناصر من الأقسام الأخرى</p>
                  </div>
                )}
              </div>
            </div>

            {/* مولد الاقتراحات */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center space-x-2 space-x-reverse">
                  <Wand2 className="w-4 h-4" />
                  <span>اقتراحات السرد</span>
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateContextualNarrative}
                  disabled={isGenerating}
                >
                  {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                </Button>
              </div>
              
              <div className="space-y-2">
                {generatedSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <p className="text-sm italic">{suggestion}</p>
                  </div>
                ))}
                
                {generatedSuggestions.length === 0 && !isGenerating && (
                  <p className="text-xs text-gray-500 text-center py-4">
                    اضغط على "مولد الاقتراحات" للحصول على أفكار للسرد
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* محرر المشهد */}
      <div className={`transition-all duration-300 ${showInspirationPalette ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
        <Card className="h-full">
          <CardHeader className="sticky top-0 bg-white z-10 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2 space-x-reverse">
                <FileText className="w-5 h-5" />
                <span>محرر المشهد الذكي</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(sceneText)}>
                  <Copy className="w-4 h-4 ml-1" />
                  نسخ
                </Button>
                <Button size="sm" variant="outline" onClick={exportScene}>
                  <Download className="w-4 h-4 ml-1" />
                  تصدير
                </Button>
                <Button size="sm">
                  <Save className="w-4 h-4 ml-1" />
                  حفظ
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 h-full">
            <div
              className="h-full p-4"
              onDrop={handleElementDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Textarea
                ref={textareaRef}
                value={sceneText}
                onChange={(e) => setSceneText(e.target.value)}
                placeholder="ابدأ كتابة مشهدك هنا... يمكنك سحب العناصر من لوحة الإلهام أو كتابة النص مباشرة"
                className="w-full h-full min-h-[500px] resize-none border-0 focus:ring-0 text-lg leading-relaxed"
                style={{ fontFamily: 'Arial, sans-serif' }}
              />
              
              {/* إحصائيات المحرر */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
                <span>الكلمات: {sceneText.split(' ').filter(word => word.length > 0).length}</span>
                <span>الأحرف: {sceneText.length}</span>
                <span>العناصر المستخدمة: {selectedElements.length}</span>
                <Badge 
                  variant={faithfulMode ? "default" : "secondary"}
                  className="text-xs"
                >
                  {faithfulMode ? 'وضع أمين' : 'وضع إبداعي'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
