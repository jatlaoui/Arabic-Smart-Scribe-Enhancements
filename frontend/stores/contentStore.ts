
// Content Store محسن مع حفظ تلقائي ومعالجة المحتوى
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface DocumentMetadata {
  wordCount: number;
  characterCount: number;
  readingTime: number; // بالدقائق
  lastModified: Date;
  version: number;
}

interface ContentState {
  // المحتوى الرئيسي
  content: string;
  title: string;
  metadata: DocumentMetadata;
  
  // حالة الحفظ
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  
  // التاريخ والإصدارات
  versions: Array<{
    id: string;
    content: string;
    timestamp: Date;
    description: string;
  }>;
  
  // المشروع الحالي
  currentProjectId: string | null;
  
  // إعدادات المحرر
  editorSettings: {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    autoSave: boolean;
    autoSaveInterval: number; // بالثواني
  };
}

interface ContentActions {
  // إدارة المحتوى
  setText: (text: string) => void;
  setTitle: (title: string) => void;
  appendText: (text: string) => void;
  insertText: (text: string, position: number) => void;
  
  // إدارة الحفظ
  save: () => Promise<void>;
  autoSave: () => Promise<void>;
  markClean: () => void;
  
  // إدارة الإصدارات
  createVersion: (description: string) => void;
  restoreVersion: (versionId: string) => void;
  
  // إدارة المشروع
  setCurrentProject: (projectId: string) => void;
  loadProject: (projectId: string) => Promise<void>;
  
  // إعدادات المحرر
  updateEditorSettings: (settings: Partial<ContentState['editorSettings']>) => void;
  
  // أدوات مساعدة
  getWordCount: () => number;
  getReadingTime: () => number;
  clearContent: () => void;
}

// دالة حساب البيانات الوصفية
const calculateMetadata = (content: string): DocumentMetadata => {
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const characterCount = content.length;
  const readingTime = Math.ceil(wordCount / 200); // 200 كلمة في الدقيقة
  
  return {
    wordCount,
    characterCount,
    readingTime,
    lastModified: new Date(),
    version: 1
  };
};

export const useContentStore = create<ContentState & ContentActions>()(
  persist(
    (set, get) => ({
      // الحالة الأولية
      content: '',
      title: 'مستند جديد',
      metadata: calculateMetadata(''),
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      saveError: null,
      versions: [],
      currentProjectId: null,
      editorSettings: {
        fontSize: 16,
        fontFamily: 'Arial',
        lineHeight: 1.6,
        autoSave: true,
        autoSaveInterval: 30
      },
      
      // الإجراءات
      setText: (text) => {
        set((state) => ({
          content: text,
          metadata: calculateMetadata(text),
          isDirty: true,
          saveError: null
        }));
      },
      
      setTitle: (title) => {
        set({ title, isDirty: true });
      },
      
      appendText: (text) => {
        const currentContent = get().content;
        get().setText(currentContent + text);
      },
      
      insertText: (text, position) => {
        const currentContent = get().content;
        const newContent = currentContent.slice(0, position) + text + currentContent.slice(position);
        get().setText(newContent);
      },
      
      save: async () => {
        const state = get();
        
        if (!state.isDirty || state.isSaving) return;
        
        set({ isSaving: true, saveError: null });
        
        try {
          const saveData = {
            title: state.title,
            content: state.content,
            project_id: state.currentProjectId,
            metadata: state.metadata
          };
          
          await axios.post('/api/content/save', saveData);
          
          set({
            isSaving: false,
            isDirty: false,
            lastSaved: new Date(),
            saveError: null
          });
          
        } catch (error) {
          set({
            isSaving: false,
            saveError: error instanceof Error ? error.message : 'خطأ في الحفظ'
          });
          throw error;
        }
      },
      
      autoSave: async () => {
        const state = get();
        
        if (!state.editorSettings.autoSave || !state.isDirty) return;
        
        try {
          await get().save();
        } catch (error) {
          // الحفظ التلقائي فشل، لكن لا نرمي خطأ
          console.warn('فشل الحفظ التلقائي:', error);
        }
      },
      
      markClean: () => {
        set({ isDirty: false });
      },
      
      createVersion: (description) => {
        const state = get();
        const versionId = Date.now().toString();
        
        set((prevState) => ({
          versions: [...prevState.versions, {
            id: versionId,
            content: state.content,
            timestamp: new Date(),
            description
          }],
          metadata: { ...state.metadata, version: state.metadata.version + 1 }
        }));
      },
      
      restoreVersion: (versionId) => {
        const state = get();
        const version = state.versions.find(v => v.id === versionId);
        
        if (version) {
          get().setText(version.content);
          get().createVersion(`استرجاع من الإصدار: ${version.description}`);
        }
      },
      
      setCurrentProject: (projectId) => {
        set({ currentProjectId: projectId });
      },
      
      loadProject: async (projectId) => {
        try {
          const response = await axios.get(`/api/projects/${projectId}/content`);
          const projectData = response.data;
          
          set({
            content: projectData.content || '',
            title: projectData.title || 'مشروع محمل',
            currentProjectId: projectId,
            metadata: calculateMetadata(projectData.content || ''),
            isDirty: false,
            lastSaved: new Date(projectData.last_modified)
          });
          
        } catch (error) {
          console.error('خطأ في تحميل المشروع:', error);
          throw error;
        }
      },
      
      updateEditorSettings: (settings) => {
        set((state) => ({
          editorSettings: { ...state.editorSettings, ...settings }
        }));
      },
      
      getWordCount: () => {
        return get().metadata.wordCount;
      },
      
      getReadingTime: () => {
        return get().metadata.readingTime;
      },
      
      clearContent: () => {
        set({
          content: '',
          title: 'مستند جديد',
          metadata: calculateMetadata(''),
          isDirty: false,
          versions: [],
          currentProjectId: null
        });
      }
    }),
    {
      name: 'arabic-scribe-content-state',
      partialize: (state) => ({
        content: state.content,
        title: state.title,
        currentProjectId: state.currentProjectId,
        editorSettings: state.editorSettings,
        versions: state.versions.slice(-5) // احتفظ بآخر 5 إصدارات فقط
      })
    }
  )
);

// Hook للحفظ التلقائي
export const useAutoSave = () => {
  const { autoSave, editorSettings, isDirty } = useContentStore();
  
  React.useEffect(() => {
    if (!editorSettings.autoSave || !isDirty) return;
    
    const interval = setInterval(() => {
      autoSave();
    }, editorSettings.autoSaveInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoSave, editorSettings.autoSave, editorSettings.autoSaveInterval, isDirty]);
};

export default useContentStore;
