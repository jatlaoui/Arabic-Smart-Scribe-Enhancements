
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Panel {
  id: string;
  name: string;
  isVisible: boolean;
  isTransparent: boolean;
  position: 'left' | 'right' | 'bottom';
  width?: number;
  height?: number;
}

interface EmotionalArc {
  position: number;
  emotion: 'sad' | 'angry' | 'hopeful' | 'neutral';
  intensity: number;
}

interface FlowState {
  isActive: boolean;
  hideAllPanels: boolean;
  dimmedOpacity: number;
}

interface AppState {
  // UI State
  panels: Panel[];
  flowState: FlowState;
  currentTheme: 'light' | 'dark' | 'focus';
  
  // Content State
  currentText: string;
  emotionalArc: EmotionalArc[];
  selectedText: string;
  
  // Actions
  togglePanel: (panelId: string) => void;
  setPanelTransparency: (panelId: string, isTransparent: boolean) => void;
  setPanelPosition: (panelId: string, position: 'left' | 'right' | 'bottom') => void;
  toggleFlowState: () => void;
  updateText: (text: string) => void;
  updateEmotionalArc: (arc: EmotionalArc[]) => void;
  setSelectedText: (text: string) => void;
  addPanel: (panel: Omit<Panel, 'id'>) => void;
  removePanel: (panelId: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial State
      panels: [
        {
          id: 'storyboard',
          name: 'لوحة القصة',
          isVisible: false,
          isTransparent: false,
          position: 'right'
        },
        {
          id: 'analytics',
          name: 'التحليلات',
          isVisible: false,
          isTransparent: false,
          position: 'left'
        },
        {
          id: 'idea-generator',
          name: 'مولد الأفكار',
          isVisible: false,
          isTransparent: false,
          position: 'bottom'
        }
      ],
      flowState: {
        isActive: false,
        hideAllPanels: false,
        dimmedOpacity: 0.3
      },
      currentTheme: 'light',
      currentText: '',
      emotionalArc: [],
      selectedText: '',

      // Actions
      togglePanel: (panelId) => set((state) => ({
        panels: state.panels.map(panel =>
          panel.id === panelId 
            ? { ...panel, isVisible: !panel.isVisible }
            : panel
        )
      })),

      setPanelTransparency: (panelId, isTransparent) => set((state) => ({
        panels: state.panels.map(panel =>
          panel.id === panelId 
            ? { ...panel, isTransparent }
            : panel
        )
      })),

      setPanelPosition: (panelId, position) => set((state) => ({
        panels: state.panels.map(panel =>
          panel.id === panelId 
            ? { ...panel, position }
            : panel
        )
      })),

      toggleFlowState: () => set((state) => ({
        flowState: {
          ...state.flowState,
          isActive: !state.flowState.isActive,
          hideAllPanels: !state.flowState.isActive
        }
      })),

      updateText: (text) => set({ currentText: text }),

      updateEmotionalArc: (arc) => set({ emotionalArc: arc }),

      setSelectedText: (text) => set({ selectedText: text }),

      addPanel: (panel) => set((state) => ({
        panels: [...state.panels, { ...panel, id: Date.now().toString() }]
      })),

      removePanel: (panelId) => set((state) => ({
        panels: state.panels.filter(panel => panel.id !== panelId)
      }))
    }),
    {
      name: 'shahid-app-store'
    }
  )
);
