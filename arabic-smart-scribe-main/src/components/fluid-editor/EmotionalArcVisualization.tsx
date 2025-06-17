
import React from 'react';

interface EmotionalArc {
  position: number;
  emotion: 'sad' | 'angry' | 'hopeful' | 'neutral';
  intensity: number;
}

interface EmotionalArcVisualizationProps {
  arc: EmotionalArc[];
  isVisible: boolean;
}

export const EmotionalArcVisualization: React.FC<EmotionalArcVisualizationProps> = ({
  arc,
  isVisible
}) => {
  const getEmotionColor = (emotion: string, intensity: number) => {
    const alpha = intensity;
    switch (emotion) {
      case 'sad':
        return `rgba(59, 130, 246, ${alpha})`; // Blue
      case 'angry':
        return `rgba(239, 68, 68, ${alpha})`; // Red
      case 'hopeful':
        return `rgba(245, 158, 11, ${alpha})`; // Gold
      default:
        return `rgba(156, 163, 175, ${alpha})`; // Gray
    }
  };

  const createGradient = () => {
    if (arc.length === 0) return 'linear-gradient(to right, #f3f4f6)';
    
    const gradientStops = arc.map(point => 
      `${getEmotionColor(point.emotion, point.intensity)} ${point.position}%`
    ).join(', ');
    
    return `linear-gradient(to right, ${gradientStops})`;
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 h-2 transition-all duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div 
        className="w-full h-full rounded-t-sm shadow-lg"
        style={{
          background: createGradient()
        }}
      />
      
      {/* Emotion Labels */}
      <div className="absolute -top-8 left-0 right-0 flex justify-between text-xs text-gray-500">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">حزين</span>
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded">غاضب</span>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">متفائل</span>
      </div>
    </div>
  );
};
