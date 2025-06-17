
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';
import { 
  Save, 
  BarChart3, 
  Lightbulb, 
  Map,
  Palette,
  Volume2
} from 'lucide-react';

interface FlowStateOverlayProps {
  isVisible: boolean;
  currentText: string;
}

export const FlowStateOverlay: React.FC<FlowStateOverlayProps> = ({
  isVisible,
  currentText
}) => {
  const { togglePanel } = useAppStore();

  const wordCount = currentText.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-40 transition-all duration-300 ${
      isVisible ? 'opacity-70 hover:opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      
      {/* Quick Stats */}
      <div className="flex justify-center mb-4">
        <div className="bg-black bg-opacity-20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm">
          {wordCount.toLocaleString()} كلمة • {readingTime} دقيقة قراءة
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4 space-x-reverse">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePanel('analytics')}
          className="bg-black bg-opacity-20 backdrop-blur-sm text-white hover:bg-white hover:text-black"
        >
          <BarChart3 className="w-4 h-4 ml-1" />
          تحليل
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePanel('idea-generator')}
          className="bg-black bg-opacity-20 backdrop-blur-sm text-white hover:bg-white hover:text-black"
        >
          <Lightbulb className="w-4 h-4 ml-1" />
          أفكار
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePanel('storyboard')}
          className="bg-black bg-opacity-20 backdrop-blur-sm text-white hover:bg-white hover:text-black"
        >
          <Map className="w-4 h-4 ml-1" />
          لوحة القصة
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="bg-green-600 bg-opacity-80 backdrop-blur-sm text-white hover:bg-green-500"
        >
          <Save className="w-4 h-4 ml-1" />
          حفظ
        </Button>
      </div>
    </div>
  );
};
