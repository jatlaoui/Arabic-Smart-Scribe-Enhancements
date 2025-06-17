
// نظام إدارة الحالة المتقدم باستخدام Zustand
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface TaskProgress {
  taskId: string;
  status: 'pending' | 'running' | 'success' | 'failure';
  current: number;
  total: number;
  message: string;
  result?: any;
  startTime?: Date;
  endTime?: Date;
}

interface ProjectState {
  currentProject: string | null;
  videoUrl: string;
  processingStage: string;
  overallProgress: number;
  tasks: Record<string, TaskProgress>;
  results: Record<string, any>;
}

interface VideoToBookStore extends ProjectState {
  // Actions
  setProject: (projectId: string) => void;
  setVideoUrl: (url: string) => void;
  setProcessingStage: (stage: string) => void;
  updateTaskProgress: (taskId: string, progress: Partial<TaskProgress>) => void;
  addTask: (taskId: string, initialProgress: TaskProgress) => void;
  storeResult: (stage: string, result: any) => void;
  resetProject: () => void;
  
  // Computed
  isProcessing: () => boolean;
  getCurrentTask: () => TaskProgress | null;
  getStageProgress: (stage: string) => number;
  getEstimatedTimeRemaining: () => number;
}

export const useVideoToBookStore = create<VideoToBookStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentProject: null,
    videoUrl: '',
    processingStage: 'idle',
    overallProgress: 0,
    tasks: {},
    results: {},
    
    // Actions
    setProject: (projectId) => set({ currentProject: projectId }),
    
    setVideoUrl: (url) => set({ videoUrl: url }),
    
    setProcessingStage: (stage) => set({ processingStage: stage }),
    
    updateTaskProgress: (taskId, progress) => set((state) => ({
      tasks: {
        ...state.tasks,
        [taskId]: { ...state.tasks[taskId], ...progress }
      }
    })),
    
    addTask: (taskId, initialProgress) => set((state) => ({
      tasks: {
        ...state.tasks,
        [taskId]: { ...initialProgress, startTime: new Date() }
      }
    })),
    
    storeResult: (stage, result) => set((state) => ({
      results: {
        ...state.results,
        [stage]: result
      }
    })),
    
    resetProject: () => set({
      currentProject: null,
      videoUrl: '',
      processingStage: 'idle',
      overallProgress: 0,
      tasks: {},
      results: {}
    }),
    
    // Computed methods
    isProcessing: () => {
      const state = get();
      return Object.values(state.tasks).some(task => task.status === 'running');
    },
    
    getCurrentTask: () => {
      const state = get();
      const runningTasks = Object.values(state.tasks).filter(task => task.status === 'running');
      return runningTasks[0] || null;
    },
    
    getStageProgress: (stage) => {
      const state = get();
      const stageTasks = Object.values(state.tasks).filter(task => 
        task.taskId.includes(stage)
      );
      if (stageTasks.length === 0) return 0;
      
      const avgProgress = stageTasks.reduce((sum, task) => 
        sum + (task.current / task.total * 100), 0
      ) / stageTasks.length;
      
      return avgProgress;
    },
    
    getEstimatedTimeRemaining: () => {
      const state = get();
      const currentTask = get().getCurrentTask();
      if (!currentTask || !currentTask.startTime) return 0;
      
      const elapsed = Date.now() - currentTask.startTime.getTime();
      const progress = currentTask.current / currentTask.total;
      
      if (progress <= 0) return 0;
      
      const totalEstimated = elapsed / progress;
      const remaining = totalEstimated - elapsed;
      
      return Math.max(0, remaining / 1000 / 60); // minutes
    }
  }))
);

// Hook للاشتراك في تحديثات المهام
export const useTaskSubscription = (taskId: string | null) => {
  const updateTaskProgress = useVideoToBookStore(state => state.updateTaskProgress);
  
  useEffect(() => {
    if (!taskId) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/tasks/status/${taskId}`);
        const taskStatus = await response.json();
        
        updateTaskProgress(taskId, {
          status: taskStatus.status,
          current: taskStatus.current,
          total: taskStatus.total,
          message: taskStatus.message,
          result: taskStatus.result,
          endTime: taskStatus.status === 'success' || taskStatus.status === 'failure' 
            ? new Date() : undefined
        });
        
        // إيقاف الاستطلاع عند اكتمال المهمة
        if (taskStatus.status === 'success' || taskStatus.status === 'failure') {
          clearInterval(interval);
        }
        
      } catch (error) {
        console.error('خطأ في جلب حالة المهمة:', error);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [taskId, updateTaskProgress]);
};

export default useVideoToBookStore;
