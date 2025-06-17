
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Sparkles, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface StepTwoProps {
  initialText: string;
  onNext: (cleanedText: string) => void;
  onBack: () => void;
}

export const StepTwo: React.FC<StepTwoProps> = ({ initialText, onNext, onBack }) => {
  const [cleanedText, setCleanedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    originalWords: 0,
    cleanedWords: 0,
    reductionPercentage: 0
  });

  useEffect(() => {
    cleanText();
  }, []);

  const cleanText = async () => {
    setIsProcessing(true);
    try {
      const result = await apiClient.videoProcessing.cleanTranscript({
        raw_transcript: initialText
      });
      
      setCleanedText(result.cleaned_text);
      setStats({
        originalWords: result.original_length || 0,
        cleanedWords: result.cleaned_length || 0,
        reductionPercentage: result.reduction_percentage || 0
      });
    } catch (error) {
      console.error('خطأ في تنظيف النص:', error);
      setCleanedText(initialText);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    onNext(cleanedText);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Sparkles className="w-6 h-6 text-green-600" />
            <span>الخطوة 2: مراجعة النص المنظف</span>
          </div>
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 ml-1" />
            رجوع
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isProcessing ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>جاري تنظيف النص وإزالة الكلمات الحشو...</p>
          </div>
        ) : (
          <>
            <div className="flex space-x-4 space-x-reverse">
              <Badge variant="secondary">
                الكلمات الأصلية: {stats.originalWords.toLocaleString()}
              </Badge>
              <Badge variant="secondary">
                الكلمات بعد التنظيف: {stats.cleanedWords.toLocaleString()}
              </Badge>
              <Badge variant={stats.reductionPercentage > 0 ? 'default' : 'secondary'}>
                تحسين: {stats.reductionPercentage.toFixed(1)}%
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">النص المنظف</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 ml-1" />
                  {isEditing ? 'حفظ التعديلات' : 'تعديل'}
                </Button>
              </div>
              
              {isEditing ? (
                <Textarea
                  value={cleanedText}
                  onChange={(e) => setCleanedText(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {cleanedText}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">ما تم تنظيفه:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• إزالة الطوابع الزمنية والأصوات الجانبية</li>
                <li>• إزالة الكلمات الحشو والتكرارات غير المفيدة</li>
                <li>• تصحيح الأخطاء النحوية الواضحة</li>
                <li>• ربط الجمل المقطوعة لتكوين فقرات متماسكة</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext} className="px-8">
                <BookOpen className="w-4 h-4 ml-2" />
                التالي: إنشاء مخطط الكتاب
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
