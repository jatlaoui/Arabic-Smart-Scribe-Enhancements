
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Leaf, 
  Mountain, 
  Flame,
  BookOpen,
  Target
} from 'lucide-react';

interface Metaphor {
  original: string;
  metaphor: string;
  symbolism: string;
  literary_effect: string;
  type: 'nature' | 'historical' | 'religious' | 'cultural';
}

interface MetaphorEngineProps {
  themes: string[];
  context: string;
  onMetaphorsGenerated: (metaphors: Metaphor[]) => void;
}

export const MetaphorEngine: React.FC<MetaphorEngineProps> = ({
  themes,
  context,
  onMetaphorsGenerated
}) => {
  const [generatedMetaphors, setGeneratedMetaphors] = useState<Metaphor[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMetaphors = async () => {
    setIsGenerating(true);

    // محاكاة توليد الاستعارات والرمزية
    await new Promise(resolve => setTimeout(resolve, 2000));

    const metaphors: Metaphor[] = [
      {
        original: 'الانضمام للمقاومة',
        metaphor: 'زرع بذرة في تربة الحرية',
        symbolism: 'البذرة ترمز للأمل والنمو المستقبلي',
        literary_effect: 'يضفي معنى النمو والاستمرارية على النضال',
        type: 'nature'
      },
      {
        original: 'جبال الشعانبي',
        metaphor: 'حصن الأسود الذي لا يُقهر',
        symbolism: 'الجبل كرمز للصمود والعزة',
        literary_effect: 'يجسد قوة المقاومة وثباتها',
        type: 'nature'
      },
      {
        original: 'الخيانة',
        metaphor: 'سم في كأس الماء العذب',
        symbolism: 'تحويل الخير إلى شر خفي',
        literary_effect: 'يبرز قسوة الخيانة وتأثيرها المدمر',
        type: 'cultural'
      },
      {
        original: 'استشهاد الرفاق',
        metaphor: 'شموع تذوب لتنير طريق الآخرين',
        symbolism: 'التضحية كنور يرشد الأجيال',
        literary_effect: 'يضفي معنى مقدس على الشهادة',
        type: 'religious'
      },
      {
        original: 'السكة الحديدية',
        metaphor: 'شريان الاستعمار الذي يجب قطعه',
        symbolism: 'البنية التحتية كأداة هيمنة',
        literary_effect: 'يحول العمل العسكري إلى رمز تحرري',
        type: 'historical'
      },
      {
        original: 'اجتماعات المقاومة',
        metaphor: 'نسج خيوط شبكة العنكبوت الذهبية',
        symbolism: 'التخطيط كفن دقيق ومترابط',
        literary_effect: 'يصور التنظيم كعمل فني معقد',
        type: 'nature'
      }
    ];

    setGeneratedMetaphors(metaphors);
    onMetaphorsGenerated(metaphors);
    setIsGenerating(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nature': return <Leaf className="w-4 h-4" />;
      case 'historical': return <BookOpen className="w-4 h-4" />;
      case 'religious': return <Mountain className="w-4 h-4" />;
      case 'cultural': return <Flame className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nature': return 'bg-green-100 text-green-800';
      case 'historical': return 'bg-blue-100 text-blue-800';
      case 'religious': return 'bg-purple-100 text-purple-800';
      case 'cultural': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'nature': return 'طبيعية';
      case 'historical': return 'تاريخية';
      case 'religious': return 'روحانية';
      case 'cultural': return 'ثقافية';
      default: return 'عامة';
    }
  };

  const groupedMetaphors = generatedMetaphors.reduce((acc, metaphor) => {
    if (!acc[metaphor.type]) {
      acc[metaphor.type] = [];
    }
    acc[metaphor.type].push(metaphor);
    return acc;
  }, {} as Record<string, Metaphor[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span>محرك الاستعارات والرمزية</span>
        </CardTitle>
        <div className="text-sm text-gray-600">
          المواضيع: {themes.join('، ')}
        </div>
      </CardHeader>
      <CardContent>
        {!generatedMetaphors.length ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              سأقوم بتوليد استعارات ورموز أدبية تثري النص وتضفي عليه عمقاً فلسفياً وجمالياً
            </p>
            
            <Button 
              onClick={generateMetaphors} 
              disabled={isGenerating}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 ml-2" />
              {isGenerating ? 'توليد الاستعارات...' : 'توليد الاستعارات والرمزية'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">الاستعارات المولدة</h4>
              <Badge variant="secondary">{generatedMetaphors.length} استعارة</Badge>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="nature">طبيعية</TabsTrigger>
                <TabsTrigger value="historical">تاريخية</TabsTrigger>
                <TabsTrigger value="religious">روحانية</TabsTrigger>
                <TabsTrigger value="cultural">ثقافية</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {generatedMetaphors.map((metaphor, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-800">{metaphor.original}</h5>
                      <Badge className={getTypeColor(metaphor.type)}>
                        {getTypeIcon(metaphor.type)}
                        <span className="mr-1">{getTypeName(metaphor.type)}</span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-purple-600">الاستعارة: </span>
                        <span className="italic">"{metaphor.metaphor}"</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-600">الرمزية: </span>
                        <span>{metaphor.symbolism}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-600">التأثير الأدبي: </span>
                        <span>{metaphor.literary_effect}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {Object.entries(groupedMetaphors).map(([type, metaphors]) => (
                <TabsContent key={type} value={type} className="space-y-3">
                  {metaphors.map((metaphor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">{metaphor.original}</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-purple-600">الاستعارة: </span>
                          <span className="italic">"{metaphor.metaphor}"</span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-600">الرمزية: </span>
                          <span>{metaphor.symbolism}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">التأثير الأدبي: </span>
                          <span>{metaphor.literary_effect}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>

            <Button 
              variant="outline" 
              onClick={generateMetaphors}
              className="w-full"
            >
              <Target className="w-4 h-4 ml-2" />
              توليد استعارات إضافية
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
