
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Pen, 
  BookOpen, 
  Clock, 
  CheckCircle,
  Loader2,
  FileText 
} from 'lucide-react';

interface ChapterWriterProps {
  outline: any;
  progress: number;
  onStartWriting: () => void;
}

export const ChapterWriter: React.FC<ChapterWriterProps> = ({ 
  outline, 
  progress, 
  onStartWriting 
}) => {
  if (!outline) return null;

  const getCurrentChapter = () => {
    const chapterProgress = (progress - 65) / 35 * outline.chapters.length;
    return Math.floor(chapterProgress) + 1;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Pen className="w-6 h-6 text-purple-600" />
          <span>كتابة الفصول</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progress === 65 ? (
          // Ready to start writing
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">جاهز لبدء الكتابة</h3>
            <p className="text-gray-600 mb-6">
              سنقوم الآن بكتابة {outline.chapters.length} فصول بإجمالي {outline.totalEstimatedWords.toLocaleString()} كلمة
            </p>
            <Button 
              onClick={onStartWriting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Pen className="w-4 h-4 ml-2" />
              بدء الكتابة
            </Button>
          </div>
        ) : (
          // Writing in progress
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">تقدم الكتابة</h3>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                <span className="text-sm text-gray-600">
                  الفصل {getCurrentChapter()} من {outline.chapters.length}
                </span>
              </div>
            </div>

            <Progress value={((progress - 65) / 35) * 100} className="mb-6" />

            <div className="space-y-3">
              {outline.chapters.map((chapter: any, index: number) => {
                const isCompleted = getCurrentChapter() > index + 1;
                const isCurrent = getCurrentChapter() === index + 1;
                const isPending = getCurrentChapter() < index + 1;

                return (
                  <div 
                    key={chapter.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : isCurrent 
                        ? 'bg-purple-50 border-purple-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 space-x-reverse">
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                      ) : (
                        <Clock className="w-6 h-6 text-gray-400" />
                      )}
                      <div>
                        <h4 className="font-medium">الفصل {chapter.id}: {chapter.title}</h4>
                        <p className="text-sm text-gray-600">
                          {chapter.estimatedWords.toLocaleString()} كلمة متوقعة
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}
                      className={
                        isCompleted 
                          ? "bg-green-500" 
                          : isCurrent 
                          ? "bg-purple-500 text-white animate-pulse" 
                          : ""
                      }
                    >
                      {isCompleted ? 'مكتمل' : isCurrent ? 'جاري الكتابة' : 'في الانتظار'}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <div className="bg-purple-50 p-4 rounded-lg mt-6">
              <h4 className="font-semibold text-purple-800 mb-2">ما يحدث الآن:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• كتابة محتوى مفصل ومنظم لكل فصل</li>
                <li>• إضافة أمثلة وتوضيحات عملية</li>
                <li>• ربط الفصول ببعضها البعض منطقياً</li>
                <li>• مراجعة وتحسين المحتوى المكتوب</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
