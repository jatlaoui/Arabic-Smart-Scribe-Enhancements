
import React

// API Integration للمحرك الروائي مع تتبع المهام
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface TaskStatus {
  status: 'pending' | 'running' | 'success' | 'failure';
  current: number;
  total: number;
  message: string;
  result?: any;
}

const shahidAPI = {
  // تحليل معماري
  startArchitecturalAnalysis: async (content: string, projectId?: string) => {
    const response = await axios.post('/api/shahid/architectural-analysis', {
      content,
      project_id: projectId
    });
    return response.data; // returns { task_id, project_id }
  },
  
  // توليد إبداعي
  startCreativeGeneration: async (projectId: string, knowledgeBaseId: string) => {
    const response = await axios.post('/api/shahid/creative-generation', {
      project_id: projectId,
      knowledge_base_id: knowledgeBaseId
    });
    return response.data; // returns { task_id, creative_layers }
  },
  
  // توليد مشهد
  generateScene: async (projectId: string, sceneData: any) => {
    const response = await axios.post('/api/shahid/generate-scene', {
      project_id: projectId,
      scene_data: sceneData
    });
    return response.data;
  },
  
  // تتبع حالة المهمة
  getTaskStatus: async (taskId: string) => {
    const response = await axios.get(`/api/tasks/status/${taskId}`);
    return response.data as TaskStatus;
  },
  
  // استرجاع بيانات المشروع
  getProject: async (projectId: string) => {
    const response = await axios.get(`/api/projects/${projectId}`);
    return response.data;
  }
};

// Hook لتتبع المهام
const useTaskTracking = (taskId: string | null) => {
  return useQuery({
    queryKey: ['taskStatus', taskId],
    queryFn: () => shahidAPI.getTaskStatus(taskId!),
    enabled: !!taskId,
    refetchInterval: (data) => {
      // إيقاف التتبع عند اكتمال المهمة
      if (data?.status === 'success' || data?.status === 'failure') {
        return false;
      }
      return 2000; // كل ثانيتين
    },
  });
};

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
 from 'react';
import { FluidLayout } from './fluid-layout/FluidLayout';
import { useAppStore } from '@/stores/appStore';


// دوال استدعاء API للمحرك الروائي
const shahidAPI = {
  startArchitecturalAnalysis: async (projectId: string, content: string) => {
    const response = await axios.post('/api/shahid/architectural-analysis', {
      project_id: projectId,
      content: content
    });
    return response.data;
  },
  
  getAnalysisProgress: async (taskId: string) => {
    const response = await axios.get(`/api/shahid/analysis-progress/${taskId}`);
    return response.data;
  },
  
  startDevelopmentPhase: async (projectId: string) => {
    const response = await axios.post('/api/shahid/development-phase', {
      project_id: projectId
    });
    return response.data;
  }
};


export const FluidShahidApp: React.FC = () => {
  const { currentTheme } = useAppStore();

  return (
    <div 
      className={`w-full min-h-screen transition-all duration-500 ${
        currentTheme === 'dark' ? 'dark' : 
        currentTheme === 'focus' ? 'bg-gray-900' : ''
      }`}
      dir="rtl"
    >
      <FluidLayout />
    </div>
  );
};



export const ProfessionalShahidEngine: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<any>(null);
  const [creativeLayers, setCreativeLayers] = useState<any>(null);
  const [inputContent, setInputContent] = useState('');
  
  const queryClient = useQueryClient();
  
  // تتبع المهمة الحالية
  const { data: taskStatus, isLoading: isTaskRunning } = useTaskTracking(currentTaskId);
  
  // المرحلة الأولى: التحليل المعماري
  const architecturalAnalysisMutation = useMutation({
    mutationFn: (content: string) => shahidAPI.startArchitecturalAnalysis(content, projectId),
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
      setProjectId(data.project_id);
    },
    onError: (error) => {
      console.error('خطأ في بدء التحليل المعماري:', error);
    }
  });
  
  // المرحلة الثانية: التوليد الإبداعي
  const creativeGenerationMutation = useMutation({
    mutationFn: () => shahidAPI.startCreativeGeneration(projectId!, knowledgeBaseId!),
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
    },
    onError: (error) => {
      console.error('خطأ في التوليد الإبداعي:', error);
    }
  });
  
  // توليد مشهد
  const sceneGenerationMutation = useMutation({
    mutationFn: (sceneData: any) => shahidAPI.generateScene(projectId!, sceneData),
    onSuccess: (data) => {
      // عرض المشهد المولد
      console.log('مشهد مولد:', data.scene);
    }
  });
  
  // معالجة اكتمال المهام
  useEffect(() => {
    if (taskStatus?.status === 'success') {
      if (currentStage === 1) {
        // اكتمل التحليل المعماري
        setKnowledgeBase(taskStatus.result.knowledge_base);
        setKnowledgeBaseId(taskStatus.result.knowledge_base_id);
        setCurrentStage(2);
        setCurrentTaskId(null);
      } else if (currentStage === 2) {
        // اكتمل التوليد الإبداعي
        setCreativeLayers(taskStatus.result.creative_layers);
        setCurrentStage(3);
        setCurrentTaskId(null);
      }
    } else if (taskStatus?.status === 'failure') {
      console.error('فشلت المهمة:', taskStatus.message);
      setCurrentTaskId(null);
    }
  }, [taskStatus, currentStage]);
  
  // معالجات الأحداث
  const handleStartArchitecturalAnalysis = () => {
    if (inputContent.trim()) {
      architecturalAnalysisMutation.mutate(inputContent);
    }
  };
  
  const handleStartCreativeGeneration = () => {
    if (projectId && knowledgeBaseId) {
      creativeGenerationMutation.mutate();
    }
  };
  
  const handleGenerateScene = (sceneData: any) => {
    sceneGenerationMutation.mutate(sceneData);
  };
  
  return (
    <div className="professional-shahid-engine">
      <div className="engine-header">
        <h1>🎭 المحرك الروائي الاحترافي</h1>
        <div className="stage-indicator">
          المرحلة {currentStage} من 3
        </div>
      </div>
      
      {/* شريط التقدم للمهام */}
      {isTaskRunning && taskStatus && (
        <div className="task-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${(taskStatus.current / taskStatus.total) * 100}%`}}
            />
          </div>
          <div className="progress-message">{taskStatus.message}</div>
        </div>
      )}
      
      {/* المرحلة الأولى: التحليل المعماري */}
      {currentStage === 1 && (
        <div className="stage-content">
          <h2>🔍 التحليل المعماري</h2>
          <textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="أدخل النص أو الشهادة للتحليل..."
            rows={10}
            className="content-input"
          />
          <button 
            onClick={handleStartArchitecturalAnalysis}
            disabled={architecturalAnalysisMutation.isPending || isTaskRunning}
            className="primary-button"
          >
            {architecturalAnalysisMutation.isPending || isTaskRunning ? 'جاري التحليل...' : 'بدء التحليل المعماري'}
          </button>
        </div>
      )}
      
      {/* المرحلة الثانية: التوليد الإبداعي */}
      {currentStage === 2 && knowledgeBase && (
        <div className="stage-content">
          <h2>🎨 التوليد الإبداعي</h2>
          <div className="knowledge-base-summary">
            <h3>نتائج التحليل:</h3>
            <div className="entities-grid">
              <div className="entity-group">
                <h4>الشخصيات ({knowledgeBase.characters?.length || 0})</h4>
                {knowledgeBase.characters?.map((char: any, idx: number) => (
                  <div key={idx} className="entity-item">{char.name}</div>
                ))}
              </div>
              <div className="entity-group">
                <h4>الأماكن ({knowledgeBase.places?.length || 0})</h4>
                {knowledgeBase.places?.map((place: any, idx: number) => (
                  <div key={idx} className="entity-item">{place.name}</div>
                ))}
              </div>
              <div className="entity-group">
                <h4>الأحداث ({knowledgeBase.events?.length || 0})</h4>
                {knowledgeBase.events?.map((event: any, idx: number) => (
                  <div key={idx} className="entity-item">{event.title}</div>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={handleStartCreativeGeneration}
            disabled={creativeGenerationMutation.isPending || isTaskRunning}
            className="primary-button"
          >
            {creativeGenerationMutation.isPending || isTaskRunning ? 'جاري التوليد...' : 'بدء التوليد الإبداعي'}
          </button>
        </div>
      )}
      
      {/* المرحلة الثالثة: البناء السردي */}
      {currentStage === 3 && creativeLayers && (
        <div className="stage-content">
          <h2>📖 البناء السردي</h2>
          <div className="scene-builder">
            <div className="scene-controls">
              <select className="character-select">
                <option>اختر الشخصية الرئيسية</option>
                {knowledgeBase.characters?.map((char: any, idx: number) => (
                  <option key={idx} value={char.name}>{char.name}</option>
                ))}
              </select>
              <select className="place-select">
                <option>اختر المكان</option>
                {knowledgeBase.places?.map((place: any, idx: number) => (
                  <option key={idx} value={place.name}>{place.name}</option>
                ))}
              </select>
              <select className="mood-select">
                <option>اختر المزاج</option>
                <option value="dramatic">درامي</option>
                <option value="emotional">عاطفي</option>
                <option value="suspenseful">مشوق</option>
                <option value="nostalgic">حنيني</option>
              </select>
            </div>
            <button 
              onClick={() => handleGenerateScene({
                character: document.querySelector('.character-select')?.value,
                place: document.querySelector('.place-select')?.value,
                mood: document.querySelector('.mood-select')?.value
              })}
              disabled={sceneGenerationMutation.isPending}
              className="primary-button"
            >
              {sceneGenerationMutation.isPending ? 'جاري توليد المشهد...' : 'توليد المشهد'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
