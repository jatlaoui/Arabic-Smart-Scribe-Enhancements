import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Ear, 
  Wind, 
  Hand, 
  Heart,
  MapPin,
  Clock,
  Lightbulb
} from 'lucide-react';

interface SensoryDetail {
  type: 'visual' | 'auditory' | 'olfactory' | 'tactile' | 'emotional';
  description: string;
  intensity: number;
  context: string;
}

interface SensoryDetailEngineProps {
  context: {
    location: string;
    timeperiod: string;
    weather?: string;
    timeOfDay?: string;
  };
  onDetailsGenerated: (details: SensoryDetail[]) => void;
}

export const SensoryDetailEngine: React.FC<SensoryDetailEngineProps> = ({
  context,
  onDetailsGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDetails, setGeneratedDetails] = useState<SensoryDetail[]>([]);
  const [progress, setProgress] = useState(0);

  const generateSensoryDetails = async () => {
    setIsGenerating(true);
    setProgress(0);

    // محاكاة توليد التفاصيل الحسية
    const progressSteps = [20, 40, 60, 80, 100];
    
    for (const step of progressSteps) {
      setProgress(step);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // تفاصيل حسية متخصصة حسب السياق
    const contextualDetails: SensoryDetail[] = [];

    if (context.location.includes('جبل') || context.location.includes('الشعانبي')) {
      contextualDetails.push(
        {
          type: 'olfactory',
          description: 'رائحة الأعشاب البرية والتراب المبلل بعد المطر',
          intensity: 0.7,
          context: 'الجبل في فصل الشتاء'
        },
        {
          type: 'tactile',
          description: 'برودة الصخور الجيرية تحت الأقدام الحافية',
          intensity: 0.8,
          context: 'المشي في دروب الجبل'
        },
        {
          type: 'auditory',
          description: 'صدى الخطوات في الوديان الضيقة وصوت الريح بين الصخور',
          intensity: 0.6,
          context: 'الليل في الجبل'
        }
      );
    }

    if (context.location.includes('تونس') || context.location.includes('المدينة')) {
      contextualDetails.push(
        {
          type: 'olfactory',
          description: 'رائحة القهوة والياسمين تمتزج مع دخان النراجيل',
          intensity: 0.7,
          context: 'المقاهي الشعبية'
        },
        {
          type: 'auditory',
          description: 'أصوات الباعة الجائلين وقرع النحاس في الأسواق العتيقة',
          intensity: 0.8,
          context: 'النهار في السوق'
        }
      );
    }

    if (context.timeperiod.includes('1950') || context.timeperiod.includes('النضال')) {
      contextualDetails.push(
        {
          type: 'visual',
          description: 'ضوء الشموع يرقص على الوجوه المتوترة في الاجتماعات السرية',
          intensity: 0.9,
          context: 'الاجتماعات السرية'
        },
        {
          type: 'emotional',
          description: 'ثقل الصمت المحمل بالخوف والأمل في آن واحد',
          intensity: 0.8,
          context: 'لحظات الانتظار'
        }
      );
    }

    setGeneratedDetails(contextualDetails);
    onDetailsGenerated(contextualDetails);
    setIsGenerating(false);
  };

  const getSensoryIcon = (type: string) => {
    switch (type) {
      case 'visual': return <Eye className="w-4 h-4" />;
      case 'auditory': return <Ear className="w-4 h-4" />;
      case 'olfactory': return <Wind className="w-4 h-4" />;
      case 'tactile': return <Hand className="w-4 h-4" />;
      case 'emotional': return <Heart className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSensoryColor = (type: string) => {
    switch (type) {
      case 'visual': return 'bg-blue-100 text-blue-800';
      case 'auditory': return 'bg-green-100 text-green-800';
      case 'olfactory': return 'bg-yellow-100 text-yellow-800';
      case 'tactile': return 'bg-purple-100 text-purple-800';
      case 'emotional': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Lightbulb className="w-5 h-5 text-orange-600" />
          <span>محرك التفاصيل الحسية</span>
        </CardTitle>
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-1 space-x-reverse">
              <MapPin className="w-3 h-3" />
              <span>{context.location}</span>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <Clock className="w-3 h-3" />
              <span>{context.timeperiod}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!generatedDetails.length ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              بناءً على السياق التاريخي والمكاني، سأقوم بتوليد تفاصيل حسية غنية لإثراء المشاهد الأدبية
            </p>
            
            {isGenerating ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>توليد التفاصيل الحسية...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            ) : (
              <Button onClick={generateSensoryDetails} className="w-full">
                <Lightbulb className="w-4 h-4 ml-2" />
                توليد التفاصيل الحسية
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">التفاصيل الحسية المولدة</h4>
              <Badge variant="secondary">{generatedDetails.length} تفصيل</Badge>
            </div>
            
            <div className="space-y-3">
              {generatedDetails.map((detail, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getSensoryColor(detail.type)}>
                      {getSensoryIcon(detail.type)}
                      <span className="mr-1">
                        {detail.type === 'visual' ? 'بصري' :
                         detail.type === 'auditory' ? 'سمعي' :
                         detail.type === 'olfactory' ? 'شمي' :
                         detail.type === 'tactile' ? 'لمسي' : 'عاطفي'}
                      </span>
                    </Badge>
                    <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                      <span>الكثافة:</span>
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full"
                          style={{ width: `${detail.intensity * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-800 mb-1">{detail.description}</p>
                  <p className="text-xs text-gray-500 italic">{detail.context}</p>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              onClick={generateSensoryDetails}
              className="w-full"
            >
              توليد تفاصيل إضافية
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
