
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, Download, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface BookOutline {
  book_title: string;
  introduction: any;
  chapters: any[];
  conclusion: any;
  total_estimated_words: number;
}

interface StepFourProps {
  outline: BookOutline;
  cleanedText: string;
  onBack: () => void;
  onComplete: (result: any) => void;
}

interface TaskStatus {
  task_id: string;
  status: string;
  current: number;
  total: number;
  message: string;
  result?: any;
  error?: string;
}

export const StepFour: React.FC<StepFourProps> = ({ outline, cleanedText, onBack, onComplete }) => {
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [completedResult, setCompletedResult] = useState<any>(null);

  const startWriting = async () => {
    setIsRunning(true);
    try {
      // Start background task
      const taskResponse = await apiClient.tasks.startVideoToBookTask({
        raw_transcript: cleanedText,
        writing_style: "روائي"
      });
      
      const taskId = taskResponse.task_id;
      
      // Poll for task status
      const pollInterval = setInterval(async () => {
        try {
          const status = await apiClient.tasks.getTaskStatus(taskId);
          setTaskStatus(status);
          
          if (status.status === 'success') {
            clearInterval(pollInterval);
            setIsRunning(false);
            setCompletedResult(status.result);
            onComplete(status.result);
          } else if (status.status === 'failure') {
            clearInterval(pollInterval);
            setIsRunning(false);
            console.error('Task failed:', status.error);
          }
        } catch (error) {
          console.error('Error polling task status:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error starting writing task:', error);
      setIsRunning(false);
    }
  };

  const getProgressPercentage = () => {
    if (!taskStatus) return 0;
    return taskStatus.total > 0 ? (taskStatus.current / taskStatus.total) * 100 : 0;
  };

  const getStatusMessage = () => {
    if (!taskStatus) return 'جاهز للبدء';
    return taskStatus.message || `الخطوة ${taskStatus.current} من ${taskStatus.total}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <BookOpen className="w-6 h-6 text-green-600" />
            <span>الخطوة 4: كتابة الفصول</span>
          </div>
          <Button variant="outline" size="sm" onClick={onBack} disabled={isRunning}>
            <ArrowLeft className="w-4 h-4 ml-1" />
            رجوع
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">سيتم كتابة:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">عنوان الكتاب:</p>
              <p className="font-medium">{outline.book_title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">عدد الفصول:</p>
              <p className="font-medium">{outline.chapters.length + 2} (مقدمة + {outline.chapters.length} فصل + خاتمة)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">العدد المقدر للكلمات:</p>
              <p className="font-medium">{outline.total_estimated_words.toLocaleString()} كلمة</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">الوقت المقدر:</p>
              <p className="font-medium">{Math.ceil(outline.total_estimated_words / 1000)} دقيقة</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">حالة الكتابة</h3>
            <Badge 
              variant={
                taskStatus?.status === 'success' ? 'default' : 
                taskStatus?.status === 'failure' ? 'destructive' : 
                isRunning ? 'secondary' : 'outline'
              }
            >
              {taskStatus?.status === 'success' ? 'مكتملة' :
               taskStatus?.status === 'failure' ? 'فشلت' :
               isRunning ? 'جارية' : 'في الانتظار'}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{getStatusMessage()}</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-3" />
          </div>

          {!isRunning && !completedResult && (
            <Button onClick={startWriting} className="w-full" size="lg">
              <Play className="w-5 h-5 ml-2" />
              بدء كتابة الكتاب
            </Button>
          )}

          {isRunning && (
            <div className="text-center py-4">
              <div className="animate-pulse text-blue-600 mb-2">
                <BookOpen className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600">
                يتم الآن كتابة الفصول باستخدام الذكاء الاصطناعي...
              </p>
            </div>
          )}

          {completedResult && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">تم إنجاز الكتابة بنجاح! 🎉</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">الفصول المكتوبة:</span>
                    <span className="font-medium ml-2">{completedResult.data?.book?.chapters?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-green-700">إجمالي الكلمات:</span>
                    <span className="font-medium ml-2">{completedResult.data?.book?.total_words_written?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 space-x-reverse">
                <Button className="flex-1">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل الكتاب PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  <BookOpen className="w-4 h-4 ml-2" />
                  معاينة الكتاب
                </Button>
              </div>
            </div>
          )}
        </div>

        {taskStatus?.status === 'failure' && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">حدث خطأ في العملية</h4>
            <p className="text-red-700 text-sm">{taskStatus.error}</p>
            <Button 
              variant="outline" 
              onClick={startWriting} 
              className="mt-3"
              disabled={isRunning}
            >
              إعادة المحاولة
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
