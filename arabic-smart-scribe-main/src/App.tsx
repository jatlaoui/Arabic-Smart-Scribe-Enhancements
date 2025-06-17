import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { useUIStore } from '@/store/uiStore';
import { useContentStore } from '@/store/contentStore';

// Import components
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SmartTextEditor } from '@/components/editor/SmartTextEditor';
import { ResearchPanel } from '@/components/research/ResearchPanel';
import { WritingAssistant } from '@/components/writing/WritingAssistant';
import { VideoToBookWorkflow } from '@/components/video-to-book/VideoToBookWorkflow';
import { ProfessionalShahidEngine } from '@/components/narrative-engine/ProfessionalShahidEngine';

const queryClient = new QueryClient();

function App() {
  const { activePanel, sidebarCollapsed } = useUIStore();

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'text':
        return <SmartTextEditor />;
      case 'research':
        return <ResearchPanel />;
      case 'writing':
        return <WritingAssistant />;
      case 'video-to-book':
        return <VideoToBookWorkflow />;
      case 'shahid':
        return <ProfessionalShahidEngine />;
      default:
        return <SmartTextEditor />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="arabic-scribe-theme">
        <Router>
          <div className="min-h-screen bg-background flex" dir="rtl">
            <Sidebar collapsed={sidebarCollapsed} />
            
            <div className="flex-1 flex flex-col">
              <Header />
              
              <main className="flex-1 overflow-hidden">
                <div className="h-full">
                  {renderActivePanel()}
                </div>
              </main>
            </div>
          </div>
          
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;