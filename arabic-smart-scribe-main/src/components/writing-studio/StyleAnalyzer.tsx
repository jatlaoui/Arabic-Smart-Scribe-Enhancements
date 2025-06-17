
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Palette, 
  BarChart3, 
  Eye, 
  Heart,
  Zap,
  Settings
} from 'lucide-react';

interface StyleAnalyzerProps {
  content: string;
  onStyleChange: (style: any) => void;
}

export const StyleAnalyzer: React.FC<StyleAnalyzerProps> = ({ content, onStyleChange }) => {
  const [styleProfile, setStyleProfile] = useState({
    formality: 65,
    emotion: 45,
    complexity: 55,
    creativity: 70,
    clarity: 80
  });

  const [currentAnalysis, setCurrentAnalysis] = useState({
    tone: 'متوازن',
    readability: 'متوسط',
    engagement: 'جيد',
    uniqueness: 'مرتفع'
  });

  useEffect(() => {
    if (content.length > 50) {
      // Simulate style analysis
      setTimeout(() => {
        setCurrentAnalysis({
          tone: content.includes('!') ? 'حماسي' : content.includes('؟') ? 'استفهامي' : 'متوازن',
          readability: content.split(' ').length < 100 ? 'سهل' : 'متوسط',
          engagement: content.length > 500 ? 'ممتاز' : 'جيد',
          uniqueness: 'مرتفع'
        });
      }, 1000);
    }
  }, [content]);

  const handleStyleChange = (key: keyof typeof styleProfile, value: number[]) => {
    const newProfile = { ...styleProfile, [key]: value[0] };
    setStyleProfile(newProfile);
    onStyleChange(newProfile);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'حماسي': return 'bg-orange-500';
      case 'استفهامي': return 'bg-blue-500';
      case 'متوازن': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-sm">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>تحليل الأسلوب الحالي</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">النبرة</div>
              <Badge className={`${getToneColor(currentAnalysis.tone)} text-white text-xs`}>
                {currentAnalysis.tone}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">سهولة القراءة</div>
              <Badge variant="outline" className="text-xs">
                {currentAnalysis.readability}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">التفاعل</div>
              <Badge variant="outline" className="text-xs">
                {currentAnalysis.engagement}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">التفرد</div>
              <Badge variant="outline" className="text-xs">
                {currentAnalysis.uniqueness}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-sm">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>لوحة التحكم في الأسلوب</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Formality */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span>الرسمية</span>
                <span className="font-semibold">{styleProfile.formality}%</span>
              </div>
              <Slider
                value={[styleProfile.formality]}
                onValueChange={(value) => handleStyleChange('formality', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>عامي</span>
                <span>رسمي</span>
              </div>
            </div>

            {/* Emotion */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span>العاطفة</span>
                <span className="font-semibold">{styleProfile.emotion}%</span>
              </div>
              <Slider
                value={[styleProfile.emotion]}
                onValueChange={(value) => handleStyleChange('emotion', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>موضوعي</span>
                <span>عاطفي</span>
              </div>
            </div>

            {/* Complexity */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span>التعقيد</span>
                <span className="font-semibold">{styleProfile.complexity}%</span>
              </div>
              <Slider
                value={[styleProfile.complexity]}
                onValueChange={(value) => handleStyleChange('complexity', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>بسيط</span>
                <span>معقد</span>
              </div>
            </div>

            {/* Creativity */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span>الإبداع</span>
                <span className="font-semibold">{styleProfile.creativity}%</span>
              </div>
              <Slider
                value={[styleProfile.creativity]}
                onValueChange={(value) => handleStyleChange('creativity', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>مباشر</span>
                <span>إبداعي</span>
              </div>
            </div>

            {/* Clarity */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span>الوضوح</span>
                <span className="font-semibold">{styleProfile.clarity}%</span>
              </div>
              <Slider
                value={[styleProfile.clarity]}
                onValueChange={(value) => handleStyleChange('clarity', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>غامض</span>
                <span>واضح</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jatlawi Lens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-sm">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>عدسة الجطلاوي</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-amber-50 p-3 rounded-lg">
            <div className="text-xs text-amber-800 mb-2">الخصائص الأسلوبية</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>الاستعارات البصرية</span>
                <div className={`w-12 h-2 rounded ${getScoreColor(75)}`}></div>
              </div>
              <div className="flex justify-between text-xs">
                <span>التفاصيل الحسية</span>
                <div className={`w-12 h-2 rounded ${getScoreColor(60)}`}></div>
              </div>
              <div className="flex justify-between text-xs">
                <span>الإيقاع الشاعري</span>
                <div className={`w-12 h-2 rounded ${getScoreColor(85)}`}></div>
              </div>
              <div className="flex justify-between text-xs">
                <span>الحوار الداخلي</span>
                <div className={`w-12 h-2 rounded ${getScoreColor(45)}`}></div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs bg-amber-50 hover:bg-amber-100 text-amber-700"
          >
            <Zap className="w-3 h-3 ml-1" />
            تطبيق عدسة الجطلاوي
          </Button>
        </CardContent>
      </Card>

      {/* Style Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-sm">
            <Settings className="w-4 h-4 text-gray-600" />
            <span>الأساليب المحفوظة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            أسلوب أكاديمي
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            أسلوب إبداعي
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            أسلوب صحفي
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            أسلوب الجطلاوي
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
