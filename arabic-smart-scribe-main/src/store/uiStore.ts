import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type PanelType = 'text' | 'research' | 'writing' | 'shahid' | 'video-to-book';
export type FlowState = 'idle' | 'writing' | 'researching' | 'analyzing' | 'processing';
export type Theme = 'light' | 'dark' | 'auto';

interface UIState {
  // Panel management
  activePanel: PanelType;
  panelHistory: PanelType[];
  sidebarCollapsed: boolean;
  
  // Flow state
  flowState: FlowState;
  isLoading: boolean;
  
  // Theme and preferences
  currentTheme: Theme;
  language: 'ar' | 'en';
  textDirection: 'rtl' | 'ltr';
  
  // Modal and dialog states
  modals: {
    settings: boolean;
    export: boolean;
    import: boolean;
    help: boolean;
  };
  
  // Notification system
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
    dismissible: boolean;
  }>;
}

interface UIActions {
  // Panel actions
  setActivePanel: (panel: PanelType) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  
  // Flow actions
  setFlowState: (state: FlowState) => void;
  setLoading: (loading: boolean) => void;
  
  // Theme actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: 'ar' | 'en') => void;
  
  // Modal actions
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      activePanel: 'text',
      panelHistory: [],
      sidebarCollapsed: false,
      flowState: 'idle',
      isLoading: false,
      currentTheme: 'auto',
      language: 'ar',
      textDirection: 'rtl',
      modals: {
        settings: false,
        export: false,
        import: false,
        help: false,
      },
      notifications: [],
      
      // Actions
      setActivePanel: (panel) => 
        set((state) => ({
          activePanel: panel,
          panelHistory: [...state.panelHistory.filter(p => p !== panel), state.activePanel],
        })),
      
      goBack: () => 
        set((state) => {
          const previous = state.panelHistory[state.panelHistory.length - 1];
          if (previous) {
            return {
              activePanel: previous,
              panelHistory: state.panelHistory.slice(0, -1),
            };
          }
          return state;
        }),
      
      toggleSidebar: () => 
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setFlowState: (flowState) => set({ flowState }),
      setLoading: (isLoading) => set({ isLoading }),
      
      setTheme: (currentTheme) => set({ currentTheme }),
      setLanguage: (language) => 
        set({ 
          language, 
          textDirection: language === 'ar' ? 'rtl' : 'ltr' 
        }),
      
      openModal: (modal) => 
        set((state) => ({
          modals: { ...state.modals, [modal]: true }
        })),
      
      closeModal: (modal) => 
        set((state) => ({
          modals: { ...state.modals, [modal]: false }
        })),
      
      closeAllModals: () => 
        set({
          modals: {
            settings: false,
            export: false,
            import: false,
            help: false,
          }
        }),
      
      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2);
        const timestamp = Date.now();
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id, timestamp }
          ]
        }));
        
        // Auto-dismiss after 5 seconds if dismissible
        if (notification.dismissible !== false) {
          setTimeout(() => {
            get().removeNotification(id);
          }, 5000);
        }
      },
      
      removeNotification: (id) => 
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
      
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-store',
    }
  )
);