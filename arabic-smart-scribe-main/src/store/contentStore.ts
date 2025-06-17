import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface EmotionalArc {
  points: Array<{
    position: number;
    intensity: number;
    emotion: string;
    description: string;
  }>;
  overall_tone: string;
}

interface ContentState {
  // Text content
  currentText: string;
  selectedText: string;
  textHistory: Array<{
    id: string;
    content: string;
    timestamp: number;
    version: number;
  }>;
  
  // Project management
  currentProject: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    wordCount: number;
    targetWordCount?: number;
  } | null;
  
  // Writing analysis
  emotionalArc: EmotionalArc | null;
  writingMetrics: {
    readability: number;
    complexity: number;
    sentiment: number;
    keywords: string[];
  } | null;
  
  // Auto-save status
  autoSaveEnabled: boolean;
  lastSaved: string | null;
  hasUnsavedChanges: boolean;
  saveInProgress: boolean;
}

interface ContentActions {
  // Text actions
  setText: (text: string) => void;
  setSelectedText: (text: string) => void;
  appendText: (text: string) => void;
  insertTextAtCursor: (text: string, cursorPosition: number) => void;
  
  // History actions
  addToHistory: () => void;
  restoreFromHistory: (id: string) => void;
  clearHistory: () => void;
  
  // Project actions
  setCurrentProject: (project: ContentState['currentProject']) => void;
  updateProject: (updates: Partial<ContentState['currentProject']>) => void;
  
  // Analysis actions
  setEmotionalArc: (arc: EmotionalArc) => void;
  setWritingMetrics: (metrics: ContentState['writingMetrics']) => void;
  
  // Auto-save actions
  toggleAutoSave: () => void;
  markSaved: () => void;
  markUnsaved: () => void;
  setSaveInProgress: (inProgress: boolean) => void;
}

export const useContentStore = create<ContentState & ContentActions>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentText: '',
        selectedText: '',
        textHistory: [],
        currentProject: null,
        emotionalArc: null,
        writingMetrics: null,
        autoSaveEnabled: true,
        lastSaved: null,
        hasUnsavedChanges: false,
        saveInProgress: false,
        
        // Actions
        setText: (text) => 
          set((state) => {
            const hasChanges = text !== state.currentText;
            return {
              currentText: text,
              hasUnsavedChanges: hasChanges && state.autoSaveEnabled,
              ...(state.currentProject && {
                currentProject: {
                  ...state.currentProject,
                  wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
                  updatedAt: new Date().toISOString(),
                }
              })
            };
          }),
        
        setSelectedText: (selectedText) => set({ selectedText }),
        
        appendText: (text) => 
          set((state) => {
            const newText = state.currentText + text;
            return {
              currentText: newText,
              hasUnsavedChanges: state.autoSaveEnabled,
              ...(state.currentProject && {
                currentProject: {
                  ...state.currentProject,
                  wordCount: newText.split(/\s+/).filter(word => word.length > 0).length,
                  updatedAt: new Date().toISOString(),
                }
              })
            };
          }),
        
        insertTextAtCursor: (text, cursorPosition) =>
          set((state) => {
            const before = state.currentText.slice(0, cursorPosition);
            const after = state.currentText.slice(cursorPosition);
            const newText = before + text + after;
            return {
              currentText: newText,
              hasUnsavedChanges: state.autoSaveEnabled,
            };
          }),
        
        addToHistory: () => 
          set((state) => {
            const historyEntry = {
              id: Math.random().toString(36).substring(2),
              content: state.currentText,
              timestamp: Date.now(),
              version: state.textHistory.length + 1,
            };
            return {
              textHistory: [...state.textHistory, historyEntry].slice(-50), // Keep last 50 versions
            };
          }),
        
        restoreFromHistory: (id) => 
          set((state) => {
            const historyEntry = state.textHistory.find(entry => entry.id === id);
            if (historyEntry) {
              return {
                currentText: historyEntry.content,
                hasUnsavedChanges: state.autoSaveEnabled,
              };
            }
            return state;
          }),
        
        clearHistory: () => set({ textHistory: [] }),
        
        setCurrentProject: (currentProject) => set({ currentProject }),
        
        updateProject: (updates) => 
          set((state) => ({
            currentProject: state.currentProject 
              ? { ...state.currentProject, ...updates }
              : null
          })),
        
        setEmotionalArc: (emotionalArc) => set({ emotionalArc }),
        setWritingMetrics: (writingMetrics) => set({ writingMetrics }),
        
        toggleAutoSave: () => 
          set((state) => ({ autoSaveEnabled: !state.autoSaveEnabled })),
        
        markSaved: () => 
          set({ 
            hasUnsavedChanges: false, 
            lastSaved: new Date().toISOString(),
            saveInProgress: false,
          }),
        
        markUnsaved: () => set({ hasUnsavedChanges: true }),
        
        setSaveInProgress: (saveInProgress) => set({ saveInProgress }),
      }),
      {
        name: 'content-store',
        partialize: (state) => ({
          currentText: state.currentText,
          currentProject: state.currentProject,
          textHistory: state.textHistory,
          autoSaveEnabled: state.autoSaveEnabled,
        }),
      }
    ),
    {
      name: 'content-store',
    }
  )
);