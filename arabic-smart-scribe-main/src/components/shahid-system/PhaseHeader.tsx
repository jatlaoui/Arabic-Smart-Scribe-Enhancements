
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain } from 'lucide-react';

interface PhaseHeaderProps {
  currentPhase: string;
  overallProgress: number;
}

export const PhaseHeader: React.FC<PhaseHeaderProps> = ({
  currentPhase,
  overallProgress
}) => {
  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'upload': return 'رفع المحتوى';
      case 'analysis': return 'التحليل العميق';
      case 'enhancement': return 'تعزيز المحتوى';
      case 'construction': return 'بناء المشاهد';
      case 'storyboard': return 'لوحة القصة';
      case 'styling': return 'التحرير الفني';
      default: return 'نظام الشاهد المتطور';
    }
  };

  const phases = ['upload', 'analysis', 'enhancement', 'construction', 'storyboard', 'styling'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Brain className="w-6 h-6 text-purple-600" />
            <span>{getPhaseTitle()}</span>
          </CardTitle>
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="text-sm text-gray-600">{overallProgress}% مكتمل</span>
            <div className="w-32">
              <Progress value={overallProgress} />
            </div>
          </div>
        </div>
        <div className="flex space-x-2 space-x-reverse mt-4">
          {phases.map((phase, index) => (
            <div
              key={phase}
              className={`flex items-center space-x-2 space-x-reverse px-3 py-1 rounded-full text-xs ${
                phase === currentPhase ? 'bg-purple-100 text-purple-800' :
                index < phases.indexOf(currentPhase) ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-600'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                phase === currentPhase ? 'bg-purple-600' :
                index < phases.indexOf(currentPhase) ? 'bg-green-600' :
                'bg-gray-400'
              }`} />
              <span>
                {phase === 'upload' ? 'رفع' :
                 phase === 'analysis' ? 'تحليل' :
                 phase === 'enhancement' ? 'تعزيز' :
                 phase === 'construction' ? 'بناء' :
                 phase === 'storyboard' ? 'لوحة' : 'تحرير'}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
};
