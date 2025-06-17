
import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { EmotionalArcVisualization } from './EmotionalArcVisualization';
import { FlowStateOverlay } from './FlowStateOverlay';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

export const FluidTextEditor: React.FC = () => {
  const {
    currentText,
    updateText,
    emotionalArc,
    flowState,
    toggleFlowState,
    setSelectedText
  } = useAppStore();

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [showTools, setShowTools] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleTextChange = (value: string) => {
    updateText(value);
    // Auto-analyze emotional arc every 100 characters
    if (value.length % 100 === 0) {
      analyzeEmotionalArc(value);
    }
  };

  const analyzeEmotionalArc = (text: string) => {
    // Simplified emotional analysis - in real implementation, use AI
    const sentences = text.split(/[.!?]+/);
    const arc = sentences.map((sentence, index) => {
      const sadWords = ['حزن', 'ألم', 'موت', 'فقدان'];
      const angryWords = ['غضب', 'ثورة', 'قتال', 'معركة'];
      const hopefulWords = ['أمل', 'حلم', 'مستقبل', 'نجاح'];
      
      let emotion: 'sad' | 'angry' | 'hopeful' | 'neutral' = 'neutral';
      let intensity = 0.5;

      if (sadWords.some(word => sentence.includes(word))) {
        emotion = 'sad';
        intensity = 0.7;
      } else if (angryWords.some(word => sentence.includes(word))) {
        emotion = 'angry';
        intensity = 0.8;
      } else if (hopefulWords.some(word => sentence.includes(word))) {
        emotion = 'hopeful';
        intensity = 0.6;
      }

      return {
        position: (index / sentences.length) * 100,
        emotion,
        intensity
      };
    });

    useAppStore.getState().updateEmotionalArc(arc);
  };

  const handleSelection = () => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    
    if (start !== end) {
      const selectedText = currentText.substring(start, end);
      setSelectedText(selectedText);
    }
  };

  useEffect(() => {
    const handleMouseMove = () => {
      if (flowState.isActive) {
        setShowTools(true);
        const timer = setTimeout(() => setShowTools(false), 2000);
        return () => clearTimeout(timer);
      }
    };

    if (flowState.isActive) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [flowState.isActive]);

  return (
    <div className={`relative w-full h-full transition-all duration-500 ${
      flowState.isActive 
        ? 'bg-gradient-to-b from-slate-50 to-blue-50' 
        : 'bg-white'
    }`}>
      
      {/* Flow State Toggle */}
      <div className={`absolute top-4 right-4 z-50 transition-opacity duration-300 ${
        flowState.isActive && !showTools ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFlowState}
          className={`${flowState.isActive ? 'text-blue-600' : 'text-gray-600'}`}
        >
          {flowState.isActive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span className="mr-2">{flowState.isActive ? 'تركيز أقل' : 'وضع التركيز'}</span>
        </Button>
      </div>

      {/* Main Editor */}
      <div className="relative h-full">
        <textarea
          ref={editorRef}
          value={currentText}
          onChange={(e) => handleTextChange(e.target.value)}
          onSelect={handleSelection}
          onMouseUp={handleSelection}
          placeholder="ابدأ رحلتك الأدبية هنا... دع الكلمات تتدفق كالنهر"
          className={`w-full h-full resize-none border-none outline-none transition-all duration-500 ${
            flowState.isActive 
              ? 'text-2xl leading-loose p-16 bg-transparent' 
              : 'text-lg leading-relaxed p-8 bg-white'
          }`}
          style={{
            fontFamily: "'Amiri', 'Cairo', serif",
            direction: 'rtl',
            lineHeight: flowState.isActive ? '2.5' : '1.8'
          }}
        />

        {/* Emotional Arc Visualization */}
        {emotionalArc.length > 0 && (
          <EmotionalArcVisualization 
            arc={emotionalArc}
            isVisible={!flowState.isActive || showTools}
          />
        )}
      </div>

      {/* Flow State Overlay */}
      {flowState.isActive && (
        <FlowStateOverlay 
          isVisible={showTools}
          currentText={currentText}
        />
      )}
    </div>
  );
};
