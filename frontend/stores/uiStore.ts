
// UI Store محسن مع إدارة كاملة لحالة الواجهة
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

interface UIState {
  // حالة الواجهة العامة
  activePanel: 'dashboard' | 'editor' | 'multimedia' | 'agent-studio' | 'dancing-ui';
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'ar' | 'en';
  
  // حالة التحميل العامة
  isLoading: boolean;
  loadingMessage: string;
  
  // النماذج والحوارات
  modals: {
    settings: boolean;
    help: boolean;
    about: boolean;
    videoUpload: boolean;
    projectSelector: boolean;
  };
  
  // إشعارات
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    dismissed: boolean;
  }>;
  
  // تخطيط المحرر
  editorLayout: {
    showPreview: boolean;
    previewMode: 'side' | 'tab';
    showWordCount: boolean;
    showOutline: boolean;
  };
}

interface UIActions {
  // إدارة اللوحات
  setActivePanel: (panel: UIState['activePanel']) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // إدارة المظهر
  setTheme: (theme: UIState['theme']) => void;
  setLanguage: (language: UIState['language']) => void;
  
  // إدارة التحميل
  setLoading: (loading: boolean, message?: string) => void;
  
  // إدارة النماذج
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  // إدارة الإشعارات
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // إدارة تخطيط المحرر
  togglePreview: () => void;
  setPreviewMode: (mode: UIState['editorLayout']['previewMode']) => void;
  toggleWordCount: () => void;
  toggleOutline: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // الحالة الأولية
      activePanel: 'dashboard',
      sidebarCollapsed: false,
      theme: 'auto',
      language: 'ar',
      isLoading: false,
      loadingMessage: '',
      modals: {
        settings: false,
        help: false,
        about: false,
        videoUpload: false,
        projectSelector: false
      },
      notifications: [],
      editorLayout: {
        showPreview: true,
        previewMode: 'side',
        showWordCount: true,
        showOutline: true
      },
      
      // الإجراءات
      setActivePanel: (panel) => set({ activePanel: panel }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      setTheme: (theme) => set({ theme }),
      
      setLanguage: (language) => set({ language }),
      
      setLoading: (loading, message = '') => set({ 
        isLoading: loading, 
        loadingMessage: message 
      }),
      
      openModal: (modal) => set((state) => ({
        modals: { ...state.modals, [modal]: true }
      })),
      
      closeModal: (modal) => set((state) => ({
        modals: { ...state.modals, [modal]: false }
      })),
      
      closeAllModals: () => set((state) => ({
        modals: Object.keys(state.modals).reduce((acc, key) => ({
          ...acc,
          [key]: false
        }), {} as UIState['modals'])
      })),
      
      addNotification: (notification) => {
        const id = Date.now().toString();
        set((state) => ({
          notifications: [...state.notifications, {
            ...notification,
            id,
            timestamp: new Date(),
            dismissed: false
          }]
        }));
        
        // إزالة تلقائية بعد 5 ثوان للإشعارات العادية
        if (notification.type === 'success' || notification.type === 'info') {
          setTimeout(() => {
            get().dismissNotification(id);
          }, 5000);
        }
      },
      
      dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, dismissed: true } : n
        )
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      togglePreview: () => set((state) => ({
        editorLayout: { 
          ...state.editorLayout, 
          showPreview: !state.editorLayout.showPreview 
        }
      })),
      
      setPreviewMode: (mode) => set((state) => ({
        editorLayout: { ...state.editorLayout, previewMode: mode }
      })),
      
      toggleWordCount: () => set((state) => ({
        editorLayout: { 
          ...state.editorLayout, 
          showWordCount: !state.editorLayout.showWordCount 
        }
      })),
      
      toggleOutline: () => set((state) => ({
        editorLayout: { 
          ...state.editorLayout, 
          showOutline: !state.editorLayout.showOutline 
        }
      }))
    })),
    {
      name: 'arabic-scribe-ui-state',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language,
        editorLayout: state.editorLayout
      })
    }
  )
);

export default useUIStore;
