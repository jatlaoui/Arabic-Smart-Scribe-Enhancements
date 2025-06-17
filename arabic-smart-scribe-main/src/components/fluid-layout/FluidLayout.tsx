import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { FluidTextEditor } from '../fluid-editor/FluidTextEditor';
import { FluidPanel } from './FluidPanel';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Map, 
  Lightbulb, 
  Settings,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Panel Components (simplified for demo)
const AnalyticsPanel = () => (
  <div className="space-y-4">
    <h4 className="font-semibold">تحليل النص</h4>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>معدل القراءة</span>
        <span>87%</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>التنوع اللغوي</span>
        <span>ممتاز</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>التماسك السردي</span>
        <span>92%</span>
      </div>
    </div>
  </div>
);

const StoryboardPanel = () => (
  <div className="space-y-4">
    <h4 className="font-semibold">لوحة القصة</h4>
    <div className="space-y-3">
      {['البداية', 'التطوير', 'الصراع', 'الذروة', 'الحل'].map((scene, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
          <div className="text-sm font-medium">{scene}</div>
          <div className="text-xs text-gray-600 mt-1">
            {Math.round((index + 1) * 20)}% من القصة
          </div>
        </div>
      ))}
    </div>
  </div>
);

const IdeaGeneratorPanel = () => (
  <div className="space-y-4">
    <h4 className="font-semibold">مولد الأفكار</h4>
    <div className="space-y-2">
      {[
        'أضف مشهد استطرادي عن الطفولة',
        'طور الحوار بين الشخصيات',
        'اكتب وصفاً للمكان أكثر تفصيلاً'
      ].map((idea, index) => (
        <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
          {idea}
        </div>
      ))}
    </div>
  </div>
);

export const FluidLayout: React.FC = () => {
  const { togglePanel, flowState } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      
      {/* Quick Panel Toggles - Hidden in Flow State */}
      {!flowState.isActive && (
        <div className="fixed top-4 left-4 z-40 flex space-x-2 space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={() => togglePanel('analytics')}
            className="shadow-lg"
          >
            <BarChart3 className="w-4 h-4 ml-1" />
            تحليل
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => togglePanel('storyboard')}
            className="shadow-lg"
          >
            <Map className="w-4 h-4 ml-1" />
            لوحة القصة
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => togglePanel('idea-generator')}
            className="shadow-lg"
          >
            <Lightbulb className="w-4 h-4 ml-1" />
            أفكار
          </Button>

          <Link to="/witness">
            <Button
              variant="outline"
              size="sm"
              className="shadow-lg"
            >
              <FileText className="w-4 h-4 ml-1" />
              نظام الشاهد
            </Button>
          </Link>
        </div>
      )}

      {/* Main Editor */}
      <FluidTextEditor />

      {/* Floating Panels */}
      <FluidPanel panelId="analytics" title="التحليلات المتقدمة">
        <AnalyticsPanel />
      </FluidPanel>

      <FluidPanel panelId="storyboard" title="لوحة القصة المرئية">
        <StoryboardPanel />
      </FluidPanel>

      <FluidPanel panelId="idea-generator" title="مولد الأفكار الذكي">
        <IdeaGeneratorPanel />
      </FluidPanel>
    </div>
  );
};
