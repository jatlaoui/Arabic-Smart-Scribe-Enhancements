
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  MapPin, 
  Palette, 
  Download 
} from 'lucide-react';

interface GeneratedScenesGridProps {
  generatedScenes: any[];
  onMoveToStoryboard: () => void;
  onOpenStyleEditor: (text: string) => void;
}

export const GeneratedScenesGrid: React.FC<GeneratedScenesGridProps> = ({
  generatedScenes,
  onMoveToStoryboard,
  onOpenStyleEditor
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2 space-x-reverse">
            <BookOpen className="w-5 h-5" />
            <span>المشاهد المولدة ({generatedScenes.length})</span>
          </span>
          <Button onClick={onMoveToStoryboard}>
            <MapPin className="w-4 h-4 ml-2" />
            انتقل للوحة القصة
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {generatedScenes.map((scene, index) => (
            <Card key={index} className="p-4">
              <h4 className="font-semibold mb-2">{scene.title}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{scene.content}</p>
              <div className="flex space-x-2 space-x-reverse">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onOpenStyleEditor(scene.content)}
                >
                  <Palette className="w-3 h-3 ml-1" />
                  تحرير
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-3 h-3 ml-1" />
                  تصدير
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
