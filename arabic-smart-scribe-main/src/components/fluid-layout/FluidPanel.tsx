
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Move, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface FluidPanelProps {
  panelId: string;
  title: string;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const FluidPanel: React.FC<FluidPanelProps> = ({
  panelId,
  title,
  children,
  defaultWidth = 300,
  defaultHeight = 400
}) => {
  const { 
    panels, 
    togglePanel, 
    setPanelTransparency, 
    setPanelPosition,
    flowState 
  } = useAppStore();
  
  const panel = panels.find(p => p.id === panelId);
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: defaultWidth,
    height: defaultHeight
  });

  if (!panel?.isVisible || flowState.hideAllPanels) return null;

  const getPositionClasses = () => {
    switch (panel.position) {
      case 'left':
        return 'fixed left-4 top-1/2 transform -translate-y-1/2 z-30';
      case 'right':
        return 'fixed right-4 top-1/2 transform -translate-y-1/2 z-30';
      case 'bottom':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30';
      default:
        return 'fixed right-4 top-1/2 transform -translate-y-1/2 z-30';
    }
  };

  const handlePositionChange = (newPosition: 'left' | 'right' | 'bottom') => {
    setPanelPosition(panelId, newPosition);
  };

  return (
    <Card 
      className={`${getPositionClasses()} transition-all duration-300 shadow-2xl ${
        panel.isTransparent ? 'bg-opacity-60 backdrop-blur-md' : 'bg-white'
      }`}
      style={{
        width: panel.position === 'bottom' ? 'auto' : dimensions.width,
        height: panel.position === 'bottom' ? 'auto' : dimensions.height,
        maxWidth: panel.position === 'bottom' ? '80vw' : '25vw',
        maxHeight: panel.position === 'bottom' ? '40vh' : '80vh'
      }}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-sm">{title}</h3>
        
        <div className="flex items-center space-x-1 space-x-reverse">
          {/* Position Controls */}
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePositionChange('left')}
              className={`p-1 ${panel.position === 'left' ? 'bg-blue-100' : ''}`}
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePositionChange('bottom')}
              className={`p-1 ${panel.position === 'bottom' ? 'bg-blue-100' : ''}`}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePositionChange('right')}
              className={`p-1 ${panel.position === 'right' ? 'bg-blue-100' : ''}`}
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>

          {/* Transparency Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPanelTransparency(panelId, !panel.isTransparent)}
            className="p-1"
          >
            {panel.isTransparent ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>

          {/* Close */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePanel(panelId)}
            className="p-1"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
        {children}
      </div>
    </Card>
  );
};
