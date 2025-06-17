
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp,
  BookOpen,
  Wand2
} from 'lucide-react';

interface WritingAssistantProps {
  content: string;
  onSuggestion: (suggestion: string) => void;
}

export const WritingAssistant: React.FC<WritingAssistantProps> = ({ content, onSuggestion }) => {
  const [suggestions] = useState([
    {
      type: 'structure',
      title: 'تحسين البنية',
      suggestion: 'يمكنك إضافة عناوين فرعية لتنظيم المحتوى بشكل أفضل.',
      action: () => onSuggestion('\n\n## عنوان فرعي\n\n')
    },
    {
      type: 'content',
      title: 'إثراء المحتوى',
      suggestion: 'أضف مثالاً عملياً لتوضيح الفكرة.',
      action: () => onSuggestion('\n\nمثال: ')
    },
    {
      type: 'flow',
      title: 'تحسين التدفق',
      suggestion: 'استخدم جملة ربط لتحسين انسيابية النص.',
      action: () => onSuggestion('\n\nبالإضافة إلى ذلك، ')
    }
  ]);

  const getWritingStats = () => {
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    const characters = content.length;
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0).length;
    
    return { words, characters, paragraphs };
  };

  const stats = getWritingStats();

  return (
    <div className="space-y-4">
      {/* Writing Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-sm">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>إحصائيات الكتابة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>الكلمات</span>
                <span className="font-semibold">{stats.words.toLocaleString()}</span>
              </div>
              <Progress value={Math.min((stats.words / 1000) * 100, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>الأحرف</span>
                <span className="font-semibold">{stats.characters.toLocaleString()}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>الفقرات</span>
                <span className="font-semibold">{stats.paragraphs}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-sm">
            <Brain className="w-4 h-4 text-purple-600" />
            <span>اقتراحات ذكية</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {suggestion.type === 'structure' ? 'بنية' : 
                   suggestion.type === 'content' ? 'محتوى' : 'تدفق'}
                </Badge>
                <Lightbulb className="w-4 h-4 text-yellow-500" />
              </div>
              <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
              <p className="text-xs text-gray-600 mb-2">{suggestion.suggestion}</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={suggestion.action}
                className="w-full text-xs"
              >
                <Wand2 className="w-3 h-3 ml-1" />
                تطبيق
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Writing Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-sm">
            <Target className="w-4 h-4 text-green-600" />
            <span>أهداف الكتابة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>هدف اليوم</span>
              <span className="text-green-600 font-semibold">500 كلمة</span>
            </div>
            <Progress value={(stats.words / 500) * 100} className="h-2" />
            <p className="text-xs text-gray-600">
              {stats.words >= 500 ? 
                '🎉 تم تحقيق هدف اليوم!' : 
                `${500 - stats.words} كلمة متبقية`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-sm">
            <BookOpen className="w-4 h-4 text-orange-600" />
            <span>إجراءات سريعة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={() => onSuggestion('\n\n---\n\n## خلاصة\n\n')}
          >
            إضافة خلاصة
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={() => onSuggestion('\n\n> ')}
          >
            إضافة اقتباس
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={() => onSuggestion('\n\n- ')}
          >
            إضافة قائمة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
