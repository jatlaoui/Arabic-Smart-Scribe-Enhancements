
// سير عمل "فيديو إلى كتاب" محسن مع ربط كامل للمهام الخلفية
import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface TaskStatus {
  status: 'pending' | 'running' | 'success' | 'failure';
  current: number;
  total: number;
  message: string;
  result?: any;
  progress_percentage?: number;
}

interface VideoToBookStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  taskId?: string;
  result?: any;
}

export const EnhancedVideoToBookWorkflow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [steps, setSteps] = useState<VideoToBookStep[]>([
    {
      id: 'extract_transcript',
      title: '📹 استخراج النص من الفيديو',
      description: 'تحويل الصوت إلى نص باستخدام Whisper AI',
      status: 'pending'
    },
    {
      id: 'clean_transcript',
      title: '🧹 تنظيف وتحسين النص',
      description: 'تنظيف النص وإزالة التكرارات والأخطاء',
      status: 'pending'
    },
    {
      id: 'architectural_analysis',
      title: '🏗️ التحليل المعماري',
      description: 'استخراج الشخصيات والأحداث والأماكن',
      status: 'pending'
    },
    {
      id: 'creative_development',
      title: '🎨 التطوير الإبداعي',
      description: 'تطوير العناصر السردية والقوس العاطفي',
      status: 'pending'
    },
    {
      id: 'narrative_generation',
      title: '📖 توليد الرواية',
      description: 'كتابة الرواية النهائية بأسلوب أدبي',
      status: 'pending'
    }
  ]);
  
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // تتبع المهمة الحالية مع استطلاع كل ثانيتين
  const { data: taskStatus } = useQuery({
    queryKey: ['taskStatus', currentTaskId],
    queryFn: async () => {
      if (!currentTaskId) return null;
      const response = await axios.get(`/api/tasks/status/${currentTaskId}`);
      return response.data as TaskStatus;
    },
    enabled: !!currentTaskId,
    refetchInterval: 2000, // كل ثانيتين
    refetchIntervalInBackground: true
  });
  
  // معالجة تغير حالة المهمة
  useEffect(() => {
    if (taskStatus && currentTaskId) {
      setSteps(prev => prev.map((step, index) => {
        if (index === currentStep) {
          return {
            ...step,
            status: taskStatus.status === 'running' ? 'running' : 
                   taskStatus.status === 'success' ? 'completed' : 
                   taskStatus.status === 'failure' ? 'error' : 'pending'
          };
        }
        return step;
      }));
      
      // عند اكتمال المهمة بنجاح
      if (taskStatus.status === 'success') {
        setSteps(prev => prev.map((step, index) => {
          if (index === currentStep) {
            return { ...step, status: 'completed', result: taskStatus.result };
          }
          return step;
        }));
        
        // الانتقال للخطوة التالية
        setTimeout(() => {
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            setCurrentTaskId(null);
          }
        }, 1000);
      }
      
      // معالجة الأخطاء
      if (taskStatus.status === 'failure') {
        setSteps(prev => prev.map((step, index) => {
          if (index === currentStep) {
            return { ...step, status: 'error' };
          }
          return step;
        }));
        setCurrentTaskId(null);
      }
    }
  }, [taskStatus, currentTaskId, currentStep]);
  
  // مهمة بدء معالجة الفيديو
  const startVideoProcessing = useMutation({
    mutationFn: async (videoUrl: string) => {
      const response = await axios.post('/api/video-to-book/start-processing', {
        video_url: videoUrl
      });
      return response.data;
    },
    onSuccess: (data) => {
      setProjectId(data.project_id);
      setCurrentTaskId(data.task_id);
      setCurrentStep(0);
    }
  });
  
  // بدء الخطوة التالية
  const proceedToNextStep = async () => {
    if (!projectId) return;
    
    const stepId = steps[currentStep].id;
    let endpoint = '';
    
    switch (stepId) {
      case 'extract_transcript':
        endpoint = '/api/video-to-book/extract-transcript';
        break;
      case 'clean_transcript':
        endpoint = '/api/video-to-book/clean-transcript';
        break;
      case 'architectural_analysis':
        endpoint = '/api/shahid/architectural-analysis';
        break;
      case 'creative_development':
        endpoint = '/api/shahid/creative-generation';
        break;
      case 'narrative_generation':
        endpoint = '/api/shahid/generate-narrative';
        break;
    }
    
    try {
      const response = await axios.post(endpoint, {
        project_id: projectId,
        // إضافة البيانات المطلوبة من الخطوات السابقة
        previous_results: steps.slice(0, currentStep).map(s => s.result)
      });
      
      setCurrentTaskId(response.data.task_id);
    } catch (error) {
      console.error('خطأ في بدء الخطوة:', error);
    }
  };
  
  // حساب التقدم الإجمالي
  const overallProgress = steps.reduce((acc, step, index) => {
    if (step.status === 'completed') return acc + (100 / steps.length);
    if (step.status === 'running' && taskStatus) {
      return acc + ((taskStatus.progress_percentage || 0) / steps.length);
    }
    return acc;
  }, 0);
  
  return (
    <div className="enhanced-video-to-book">
      <div className="workflow-header">
        <h1>📹➡️📚 من فيديو إلى رواية - محسن</h1>
        <div className="overall-progress">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${overallProgress}%`,
                backgroundColor: overallProgress === 100 ? '#10b981' : '#3b82f6'
              }}
            />
          </div>
          <span className="progress-text">{overallProgress.toFixed(1)}%</span>
        </div>
      </div>
      
      {/* إدخال رابط الفيديو */}
      {!projectId && (
        <div className="video-input-section">
          <h2>🔗 أدخل رابط الفيديو</h2>
          <div className="input-group">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="video-url-input"
            />
            <button
              onClick={() => startVideoProcessing.mutate(videoUrl)}
              disabled={!videoUrl || startVideoProcessing.isPending}
              className="start-button"
            >
              {startVideoProcessing.isPending ? 'جاري البدء...' : 'بدء المعالجة 🚀'}
            </button>
          </div>
        </div>
      )}
      
      {/* خطوات سير العمل */}
      {projectId && (
        <div className="workflow-steps">
          <div className="steps-timeline">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`step-item ${
                  index === currentStep ? 'current' : 
                  step.status === 'completed' ? 'completed' : 
                  step.status === 'running' ? 'running' : 
                  step.status === 'error' ? 'error' : 'pending'
                }`}
              >
                <div className="step-indicator">
                  {step.status === 'completed' ? '✅' : 
                   step.status === 'running' ? '⏳' : 
                   step.status === 'error' ? '❌' : 
                   index + 1}
                </div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  
                  {/* شريط التقدم للخطوة الحالية */}
                  {index === currentStep && taskStatus && step.status === 'running' && (
                    <div className="step-progress">
                      <div className="progress-bar-mini">
                        <div 
                          className="progress-fill-mini"
                          style={{ width: `${(taskStatus.current / taskStatus.total) * 100}%` }}
                        />
                      </div>
                      <div className="progress-details">
                        <span>{taskStatus.message}</span>
                        <span>{taskStatus.current}/{taskStatus.total}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* عرض النتائج */}
                  {step.result && (
                    <div className="step-result">
                      <details>
                        <summary>عرض النتيجة</summary>
                        <pre>{JSON.stringify(step.result, null, 2)}</pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* أزرار التحكم */}
          <div className="workflow-controls">
            {currentStep < steps.length && steps[currentStep].status === 'pending' && (
              <button
                onClick={proceedToNextStep}
                disabled={currentTaskId !== null}
                className="proceed-button"
              >
                تشغيل الخطوة الحالية
              </button>
            )}
            
            {overallProgress === 100 && (
              <div className="completion-actions">
                <h3>🎉 تم اكتمال تحويل الفيديو إلى رواية!</h3>
                <div className="action-buttons">
                  <button className="download-button">
                    📥 تحميل الرواية
                  </button>
                  <button className="preview-button">
                    👁️ معاينة النتيجة
                  </button>
                  <button className="share-button">
                    📤 مشاركة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoToBookWorkflow;
