
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  Sparkles, 
  Brain, 
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Save,
  Share
} from 'lucide-react';
import { GlassmorphicCard } from '../advanced-ui/GlassmorphicCard';

interface PremiumTextEditorProps {
  onTextChange?: (text: string) => void;
}

export const PremiumTextEditor: React.FC<PremiumTextEditorProps> = ({
  onTextChange
}) => {
  const [content, setContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    { type: 'improve', text: 'تحسين الوضوح', icon: Sparkles },
    { type: 'expand', text: 'إضافة تفاصيل', icon: Brain },
    { type: 'simplify', text: 'تبسيط اللغة', icon: Wand2 }
  ];

  const handleTextChange = (value: string) => {
    setContent(value);
    onTextChange?.(value);
  };

  const handleSelection = () => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    
    if (start !== end) {
      const selected = content.substring(start, end);
      setSelectedText(selected);
    }
  };

  const insertSmartSuggestion = (suggestion: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + suggestion + content.substring(end);
    
    setContent(newContent);
    onTextChange?.(newContent);
  };

  return (
    <div className={`transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-50 bg-black/95' : 'relative'}`}>
      <GlassmorphicCard className={`${isFullscreen ? 'h-full m-4' : 'h-96'} flex flex-col`}>
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
              <Brain className="w-3 h-3 ml-1" />
              محرر ذكي
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-200">
              {content.split(' ').filter(word => word.length > 0).length} كلمة
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              {showSuggestions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex">
          {/* Main Editor */}
          <div className={`flex-1 relative ${showSuggestions ? 'border-l border-white/10' : ''}`}>
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => handleTextChange(e.target.value)}
              onSelect={handleSelection}
              onMouseUp={handleSelection}
              placeholder="ابدأ الكتابة هنا... سيقوم النظام الذكي بمساعدتك تلقائياً"
              className="w-full h-full p-6 bg-transparent text-white placeholder:text-white/50 border-none outline-none resize-none text-lg leading-relaxed"
              style={{
                fontFamily: "'Amiri', 'Cairo', serif",
                direction: 'rtl'
              }}
            />

            {/* Floating Suggestions */}
            {selectedText && (
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20">
                <div className="flex space-x-2 space-x-reverse">
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10 text-xs"
                        onClick={() => insertSmartSuggestion(suggestion.text)}
                      >
                        <Icon className="w-3 h-3 ml-1" />
                        {suggestion.text}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Smart Suggestions Panel */}
          {showSuggestions && (
            <div className="w-80 p-4 bg-white/5 space-y-4">
              <h3 className="text-white font-semibold">اقتراحات ذكية</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm font-medium">تحسين النص</span>
                  </div>
                  <p className="text-white/70 text-xs">
                    يمكنك تحسين وضوح النص وجعله أكثر تأثيراً
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-white/20 text-white hover:bg-white/10 text-xs"
                  >
                    تطبيق التحسين
                  </Button>
                </div>

                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">إضافة أفكار</span>
                  </div>
                  <p className="text-white/70 text-xs">
                    إضافة أمثلة وتفاصيل لجعل النص أكثر ثراءً
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-white/20 text-white hover:bg-white/10 text-xs"
                  >
                    إضافة تفاصيل
                  </Button>
                </div>

                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-sm font-medium">تنسيق ذكي</span>
                  </div>
                  <p className="text-white/70 text-xs">
                    تنسيق النص وتحسين بنيته التنظيمية
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-white/20 text-white hover:bg-white/10 text-xs"
                  >
                    تطبيق التنسيق
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};
