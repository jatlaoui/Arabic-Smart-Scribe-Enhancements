
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Brain, 
  FileText, 
  Clock, 
  Users, 
  Target,
  Loader2 
} from 'lucide-react';

interface VideoAnalysisPanelProps {
  videoUrl: string;
}

export const VideoAnalysisPanel: React.FC<VideoAnalysisPanelProps> = ({ videoUrl }) => {
  const progress = videoUrl ? 25 : 0; // Simple progress calculation based on videoUrl presence

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
          <span>تحليل الفيديو بالذكاء الاصطناعي</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">جاري تحليل محتوى الفيديو...</h3>
              <p className="text-gray-600">نقوم باستخراج النص وتحليل المحتوى وتحديد الموضوعات الرئيسية</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">استخراج النص</span>
              <Badge variant="secondary" className="animate-pulse">
                {progress > 10 ? 'مكتمل' : 'جاري...'}
              </Badge>
            </div>
            <Progress value={Math.min(progress * 3, 100)} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">تحليل المحتوى</span>
              <Badge variant="secondary" className="animate-pulse">
                {progress > 20 ? 'مكتمل' : 'جاري...'}
              </Badge>
            </div>
            <Progress value={Math.max(0, (progress - 10) * 2)} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">تحديد الموضوعات</span>
              <Badge variant="secondary" className="animate-pulse">
                {progress > 25 ? 'مكتمل' : 'جاري...'}
              </Badge>
            </div>
            <Progress value={Math.max(0, (progress - 20) * 2)} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">تحليل الجمهور المستهدف</span>
              <Badge variant="secondary" className="animate-pulse">
                {progress > 30 ? 'مكتمل' : 'جاري...'}
              </Badge>
            </div>
            <Progress value={Math.max(0, (progress - 25) * 1.5)} className="h-2" />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">ما يحدث الآن:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• تحويل الصوت إلى نص باستخدام تقنيات الذكاء الاصطناعي المتقدمة</li>
            <li>• تحليل بنية المحتوى وتحديد النقاط الرئيسية</li>
            <li>• استخراج المفاهيم والموضوعات الفرعية</li>
            <li>• تحديد مستوى التعقيد والجمهور المستهدف</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
