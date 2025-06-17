import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface StepStatus {
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

interface WorkflowState {
  transcript_extraction: StepStatus;
  text_cleaning: StepStatus;
  outline_generation: StepStatus;
  chapter_writing: StepStatus;
}

export const VideoToBookWorkflow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    transcript_extraction: { status: 'pending', progress: 0 },
    text_cleaning: { status: 'pending', progress: 0 },
    outline_generation: { status: 'pending', progress: 0 },
    chapter_writing: { status: 'pending', progress: 0 }
  });
  
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentTaskId, setCurrentTaskId] = useState<string>('');
  const [cleanedTranscript, setCleanedTranscript] = useState<string>('');
  const [outline, setOutline] = useState<any>(null);

  // Poll task status
  useEffect(() => {
    if (currentTaskId) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await apiClient.get(`/api/tasks/status/${currentTaskId}`);
          const taskData = response.data;
          
          updateWorkflowStep(taskData.step, {
            status: taskData.status,
            progress: taskData.progress,
            result: taskData.result,
            error: taskData.error
          });
          
          if (taskData.status === 'completed' || taskData.status === 'error') {
            clearInterval(pollInterval);
            if (taskData.status === 'completed') {
              handleStepCompletion(taskData.step, taskData.result);
            }
          }
        } catch (error) {
          console.error('Error polling task status:', error);
        }
      }, 2000);
      
      return () => clearInterval(pollInterval);
    }
  }, [currentTaskId]);

  const updateWorkflowStep = (step: string, status: StepStatus) => {
    setWorkflowState(prev => ({
      ...prev,
      [step]: status
    }));
  };

  const handleStepCompletion = (step: string, result: any) => {
    switch (step) {
      case 'text_cleaning':
        setCleanedTranscript(result.cleaned_text);
        setCurrentStep(2);
        break;
      case 'outline_generation':
        setOutline(result.outline);
        setCurrentStep(3);
        break;
      case 'chapter_writing':
        setCurrentStep(4);
        break;
    }
    setCurrentTaskId('');
  };

  const startTranscriptExtraction = async () => {
    try {
      updateWorkflowStep('transcript_extraction', { status: 'running', progress: 0 });
      const response = await apiClient.post('/api/video/extract-transcript', {
        video_url: videoUrl
      });
      
      if (response.data.task_id) {
        setCurrentTaskId(response.data.task_id);
      } else {
        // Immediate result
        updateWorkflowStep('transcript_extraction', { 
          status: 'completed', 
          progress: 100, 
          result: response.data 
        });
        setCurrentStep(2);
      }
    } catch (error) {
      updateWorkflowStep('transcript_extraction', {
        status: 'error',
        progress: 0,
        error: 'Failed to extract transcript'
      });
    }
  };

  const startTextCleaning = async () => {
    try {
      updateWorkflowStep('text_cleaning', { status: 'running', progress: 0 });
      const response = await apiClient.post('/api/video/clean-transcript', {
        transcript: workflowState.transcript_extraction.result?.transcript
      });
      setCurrentTaskId(response.data.task_id);
    } catch (error) {
      updateWorkflowStep('text_cleaning', {
        status: 'error',
        progress: 0,
        error: 'Failed to clean transcript'
      });
    }
  };

  const startOutlineGeneration = async () => {
    try {
      updateWorkflowStep('outline_generation', { status: 'running', progress: 0 });
      const response = await apiClient.post('/api/video/generate-outline', {
        cleaned_text: cleanedTranscript
      });
      setCurrentTaskId(response.data.task_id);
    } catch (error) {
      updateWorkflowStep('outline_generation', {
        status: 'error',
        progress: 0,
        error: 'Failed to generate outline'
      });
    }
  };

  const startChapterWriting = async () => {
    try {
      updateWorkflowStep('chapter_writing', { status: 'running', progress: 0 });
      const response = await apiClient.post('/api/video/write-chapters', {
        outline: outline,
        cleaned_text: cleanedTranscript
      });
      setCurrentTaskId(response.data.task_id);
    } catch (error) {
      updateWorkflowStep('chapter_writing', {
        status: 'error',
        progress: 0,
        error: 'Failed to write chapters'
      });
    }
  };

  const getStepIcon = (status: StepStatus['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>تحويل الفيديو إلى كتاب - سير العمل المتقدم</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {Object.entries(workflowState).map(([key, step], index) => (
                <div key={key} className="flex flex-col items-center">
                  {getStepIcon(step.status)}
                  <span className="text-sm mt-2 text-center">
                    {key === 'transcript_extraction' && 'استخراج النص'}
                    {key === 'text_cleaning' && 'تنظيف النص'}
                    {key === 'outline_generation' && 'إنشاء المخطط'}
                    {key === 'chapter_writing' && 'كتابة الفصول'}
                  </span>
                  {step.status === 'running' && (
                    <Progress value={step.progress} className="w-20 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Video URL Input */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">الخطوة 1: إدخال رابط الفيديو</h3>
              <Textarea
                placeholder="أدخل رابط الفيديو من يوتيوب..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="min-h-[100px] text-right"
                dir="rtl"
              />
              <Button 
                onClick={startTranscriptExtraction}
                disabled={!videoUrl || workflowState.transcript_extraction.status === 'running'}
                className="w-full"
              >
                {workflowState.transcript_extraction.status === 'running' 
                  ? 'جاري استخراج النص...' 
                  : 'استخراج النص من الفيديو'}
              </Button>
              
              {workflowState.transcript_extraction.status === 'completed' && (
                <Button onClick={startTextCleaning} className="w-full mt-4">
                  الانتقال للخطوة التالية: تنظيف النص
                </Button>
              )}
            </div>
          )}

          {/* Step 2: Text Cleaning Review */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">الخطوة 2: مراجعة النص المنظف</h3>
              <Textarea
                value={cleanedTranscript}
                onChange={(e) => setCleanedTranscript(e.target.value)}
                className="min-h-[300px] text-right"
                dir="rtl"
                placeholder="النص المنظف سيظهر هنا..."
              />
              <div className="flex gap-4">
                <Button onClick={startOutlineGeneration} className="flex-1">
                  الموافقة وإنشاء المخطط
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  العودة للخطوة السابقة
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Outline Review */}
          {currentStep === 3 && outline && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">الخطوة 3: مراجعة مخطط الكتاب</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-right" dir="rtl">
                <pre className="whitespace-pre-wrap">{JSON.stringify(outline, null, 2)}</pre>
              </div>
              <div className="flex gap-4">
                <Button onClick={startChapterWriting} className="flex-1">
                  الموافقة وبدء كتابة الفصول
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                  العودة لتعديل النص
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Chapter Writing Progress */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">الخطوة 4: كتابة الفصول</h3>
              <Alert>
                <AlertDescription>
                  جاري كتابة فصول الكتاب... يمكنك إغلاق هذه الصفحة والعودة لاحقاً لمتابعة التقدم.
                </AlertDescription>
              </Alert>
              {workflowState.chapter_writing.status === 'running' && (
                <Progress value={workflowState.chapter_writing.progress} className="w-full" />
              )}
              {workflowState.chapter_writing.status === 'completed' && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    تم الانتهاء من كتابة الكتاب بنجاح! يمكنك الآن تحميله من قسم المشاريع.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Error Display */}
          {Object.values(workflowState).some(step => step.status === 'error') && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                حدث خطأ في أحد الخطوات. يرجى المحاولة مرة أخرى.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};