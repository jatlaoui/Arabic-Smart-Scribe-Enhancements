
// المحرك الروائي الاحترافي - ربط كامل مع الـ APIs
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useVideoToBookStore } from '../stores/videoToBookStore';
import { useUIStore } from '../stores/uiStore';
import { useContentStore } from '../stores/contentStore';

interface ShahidEngineProps {
  projectId?: string;
}

export const ProfessionalShahidEngine: React.FC<ShahidEngineProps> = ({ projectId }) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  // استخدام Zustand stores
  const { setProject, addTask, updateTaskProgress, storeResult } = useVideoToBookStore();
  const { activePanel, setActivePanel } = useUIStore();
  const { content, setText } = useContentStore();
  
  const queryClient = useQueryClient();
  
  // تتبع المهمة الحالية مع استطلاع كل ثانيتين
  const { data: taskStatus, isLoading: isTaskRunning } = useQuery({
    queryKey: ['shahidTask', currentTaskId],
    queryFn: async () => {
      if (!currentTaskId) return null;
      const response = await axios.get(`/api/tasks/status/${currentTaskId}`);
      return response.data;
    },
    enabled: !!currentTaskId,
    refetchInterval: 2000,
    refetchIntervalInBackground: true
  });
  
  // مراقبة تغيرات حالة المهمة
  useEffect(() => {
    if (taskStatus && currentTaskId) {
      updateTaskProgress(currentTaskId, {
        status: taskStatus.status,
        current: taskStatus.current,
        total: taskStatus.total,
        message: taskStatus.message,
        result: taskStatus.result
      });
      
      // عند اكتمال المهمة
      if (taskStatus.status === 'success') {
        storeResult(`stage_${currentStage}`, taskStatus.result);
        
        // الانتقال للمرحلة التالية
        setTimeout(() => {
          if (currentStage < 3) {
            setCurrentStage(currentStage + 1);
            setCurrentTaskId(null);
          }
        }, 1500);
      }
      
      if (taskStatus.status === 'failure') {
        console.error('فشل في المهمة:', taskStatus.message);
        setCurrentTaskId(null);
      }
    }
  }, [taskStatus, currentTaskId, currentStage]);
  
  // المرحلة الأولى: التحليل المعماري
  const architecturalAnalysisMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await axios.post('/api/shahid/architectural-analysis', {
        content,
        project_id: projectId
      });
      return response.data;
    },
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
      addTask(data.task_id, {
        taskId: data.task_id,
        status: 'running',
        current: 0,
        total: 100,
        message: 'بدء التحليل المعماري...'
      });
      if (data.project_id) setProject(data.project_id);
    },
    onError: (error) => {
      console.error('خطأ في التحليل المعماري:', error);
    }
  });
  
  // المرحلة الثانية: التوليد الإبداعي  
  const creativeGenerationMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/shahid/creative-generation', {
        project_id: projectId,
        knowledge_base_id: useVideoToBookStore.getState().results.stage_1?.knowledge_base_id
      });
      return response.data;
    },
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
      addTask(data.task_id, {
        taskId: data.task_id,
        status: 'running',
        current: 0,
        total: 100,
        message: 'بدء التوليد الإبداعي...'
      });
    }
  });
  
  // المرحلة الثالثة: توليد المشهد
  const sceneGenerationMutation = useMutation({
    mutationFn: async (sceneData: any) => {
      const response = await axios.post('/api/shahid/generate-scene', {
        project_id: projectId,
        scene_data: sceneData
      });
      return response.data;
    },
    onSuccess: (data) => {
      // عرض النتيجة مباشرة (لا نحتاج task tracking للمشاهد القصيرة)
      setText(data.scene);
      setActivePanel('editor');
    }
  });
  
  // دالة لبدء الخطوة التالية
  const startNextStage = () => {
    switch (currentStage) {
      case 1:
        if (content.trim()) {
          architecturalAnalysisMutation.mutate(content);
        }
        break;
      case 2:
        creativeGenerationMutation.mutate();
        break;
      case 3:
        // المرحلة الثالثة تتطلب اختيار المستخدم
        break;
    }
  };
  
  // حساب التقدم الإجمالي
  const overallProgress = (() => {
    const baseProgress = (currentStage - 1) * 33.33;
    if (taskStatus && taskStatus.current && taskStatus.total) {
      const stageProgress = (taskStatus.current / taskStatus.total) * 33.33;
      return Math.min(100, baseProgress + stageProgress);
    }
    return baseProgress;
  })();
  
  return (
    <div className="professional-shahid-engine">
      <div className="engine-header">
        <h1>🎭 المحرك الروائي الاحترافي</h1>
        <div className="progress-container">
          <div className="overall-progress">
            <div 
              className="progress-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="progress-text">
            المرحلة {currentStage} من 3 - {overallProgress.toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* شريط التقدم للمهمة الحالية */}
      {isTaskRunning && taskStatus && (
        <div className="current-task-progress">
          <div className="task-info">
            <span className="task-message">{taskStatus.message}</span>
            <span className="task-numbers">{taskStatus.current}/{taskStatus.total}</span>
          </div>
          <div className="task-progress-bar">
            <div 
              className="task-progress-fill"
              style={{ width: `${(taskStatus.current / taskStatus.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* المرحلة الأولى: التحليل المعماري */}
      {currentStage === 1 && (
        <div className="stage-content">
          <h2>🔍 المرحلة الأولى: التحليل المعماري</h2>
          <textarea
            value={content}
            onChange={(e) => setText(e.target.value)}
            placeholder="أدخل النص أو الشهادة للتحليل..."
            rows={12}
            className="content-input"
            disabled={isTaskRunning}
          />
          <button 
            onClick={startNextStage}
            disabled={!content.trim() || isTaskRunning}
            className="stage-button primary"
          >
            {isTaskRunning ? 'جاري التحليل...' : 'بدء التحليل المعماري 🚀'}
          </button>
        </div>
      )}
      
      {/* المرحلة الثانية: التوليد الإبداعي */}
      {currentStage === 2 && (
        <div className="stage-content">
          <h2>🎨 المرحلة الثانية: التوليد الإبداعي</h2>
          
          {/* عرض نتائج المرحلة الأولى */}
          {useVideoToBookStore.getState().results.stage_1 && (
            <div className="previous-results">
              <h3>✅ نتائج التحليل المعماري:</h3>
              <div className="results-summary">
                <div className="result-item">
                  <strong>الشخصيات:</strong> {useVideoToBookStore.getState().results.stage_1.knowledge_base?.characters?.length || 0}
                </div>
                <div className="result-item">
                  <strong>الأحداث:</strong> {useVideoToBookStore.getState().results.stage_1.knowledge_base?.events?.length || 0}
                </div>
                <div className="result-item">
                  <strong>الأماكن:</strong> {useVideoToBookStore.getState().results.stage_1.knowledge_base?.places?.length || 0}
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={startNextStage}
            disabled={isTaskRunning}
            className="stage-button primary"
          >
            {isTaskRunning ? 'جاري التوليد...' : 'بدء التوليد الإبداعي 🎨'}
          </button>
        </div>
      )}
      
      {/* المرحلة الثالثة: البناء السردي */}
      {currentStage === 3 && (
        <div className="stage-content">
          <h2>📖 المرحلة الثالثة: البناء السردي</h2>
          
          <div className="scene-builder">
            <div className="builder-controls">
              <select className="character-select">
                <option>اختر الشخصية الرئيسية</option>
                {/* سيتم ملؤها من نتائج المراحل السابقة */}
              </select>
              
              <select className="place-select">
                <option>اختر المكان</option>
                {/* سيتم ملؤها من نتائج المراحل السابقة */}
              </select>
              
              <select className="mood-select">
                <option>اختر المزاج السردي</option>
                <option value="dramatic">درامي</option>
                <option value="emotional">عاطفي</option>
                <option value="suspenseful">مشوق</option>
                <option value="nostalgic">حنيني</option>
              </select>
              
              <button 
                onClick={() => {
                  const character = (document.querySelector('.character-select') as HTMLSelectElement)?.value;
                  const place = (document.querySelector('.place-select') as HTMLSelectElement)?.value;
                  const mood = (document.querySelector('.mood-select') as HTMLSelectElement)?.value;
                  
                  sceneGenerationMutation.mutate({ character, place, mood });
                }}
                disabled={sceneGenerationMutation.isPending}
                className="stage-button primary"
              >
                {sceneGenerationMutation.isPending ? 'جاري التوليد...' : 'توليد المشهد 📝'}
              </button>
            </div>
          </div>
          
          {overallProgress >= 99 && (
            <div className="completion-celebration">
              <h3>🎉 تم اكتمال جميع المراحل!</h3>
              <p>تم إنشاء عالمك السردي بنجاح. يمكنك الآن البدء في الكتابة!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionalShahidEngine;
