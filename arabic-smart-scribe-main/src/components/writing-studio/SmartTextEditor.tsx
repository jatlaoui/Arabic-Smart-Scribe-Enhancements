
import React
import { useAutoSave } from '../hooks/useAutoSave'
, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SmartEditingToolbar } from './SmartEditingToolbar';

interface SmartTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const SmartTextEditor: React.FC<SmartTextEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = "ابدأ الكتابة هنا..." 
}) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{x: number, y: number} | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSelection = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    
    if (selectedText.trim().length > 0) {
      setSelectedText(selectedText);
      
      // Calculate position for toolbar
      const rect = textarea.getBoundingClientRect();
      const selectionStart = textarea.selectionStart;
      
      // Approximate position calculation
      const lineHeight = 24;
      const lines = textarea.value.substring(0, selectionStart).split('\n').length;
      const y = rect.top + (lines * lineHeight) - 60;
      const x = rect.left + 100;
      
      setSelectionPosition({ x, y });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  const handleTextEdit = (editedText: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = content.substring(0, start) + editedText + content.substring(end);
    onChange(newContent);
    setShowToolbar(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowToolbar(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Card className="min-h-[600px]">
        <CardContent className="p-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onMouseUp={handleSelection}
            onKeyUp={handleSelection}
            placeholder={placeholder}
            className="w-full h-[600px] p-6 border-none resize-none focus:outline-none text-lg leading-relaxed"
            style={{ 
              fontFamily: 'Cairo, system-ui, sans-serif',
              direction: 'rtl'
            }}
          />
        </CardContent>
      </Card>

      {/* Smart Editing Toolbar */}
      {showToolbar && selectionPosition && (
        <div 
          className="fixed z-50"
          style={{ 
            left: selectionPosition.x, 
            top: selectionPosition.y 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <SmartEditingToolbar
            selectedText={selectedText}
            onEdit={handleTextEdit}
            onClose={() => setShowToolbar(false)}
          />
        </div>
      )}
    </div>
  );
};
