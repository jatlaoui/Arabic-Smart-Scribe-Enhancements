
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Video, FileText } from 'lucide-react';

interface StepOneProps {
  onNext: (data: { videoUrl?: string; transcript?: string }) => void;
}

export const StepOne: React.FC<StepOneProps> = ({ onNext }) => {
  const [inputMethod, setInputMethod] = useState<'url' | 'upload'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');

  const handleNext = () => {
    if (inputMethod === 'url' && videoUrl.trim()) {
      onNext({ videoUrl: videoUrl.trim() });
    } else if (inputMethod === 'upload' && transcript.trim()) {
      onNext({ transcript: transcript.trim() });
    }
  };

  const canProceed = 
    (inputMethod === 'url' && videoUrl.trim()) || 
    (inputMethod === 'upload' && transcript.trim());

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Video className="w-6 h-6 text-blue-600" />
          <span>الخطوة 1: إدخال المحتوى</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-4 space-x-reverse">
          <Button
            variant={inputMethod === 'url' ? 'default' : 'outline'}
            onClick={() => setInputMethod('url')}
            className="flex-1"
          >
            <Video className="w-4 h-4 ml-2" />
            رابط فيديو
          </Button>
          <Button
            variant={inputMethod === 'upload' ? 'default' : 'outline'}
            onClick={() => setInputMethod('upload')}
            className="flex-1"
          >
            <Upload className="w-4 h-4 ml-2" />
            رفع نص مباشر
          </Button>
        </div>

        {inputMethod === 'url' ? (
          <div className="space-y-3">
            <label className="text-sm font-medium">رابط الفيديو</label>
            <Input
              placeholder="أدخل رابط الفيديو من YouTube أو أي منصة أخرى..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="text-sm text-gray-600">
              سيتم استخراج النص من الفيديو تلقائياً باستخدام تقنيات الذكاء الاصطناعي
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-sm font-medium">النص المكتوب أو المنسوخ</label>
            <Textarea
              placeholder="الصق النص هنا أو اكتبه مباشرة..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={10}
            />
            <p className="text-sm text-gray-600">
              يمكنك لصق النص من أي مصدر أو كتابته مباشرة
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            className="px-8"
          >
            <FileText className="w-4 h-4 ml-2" />
            التالي: تنظيف النص
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
