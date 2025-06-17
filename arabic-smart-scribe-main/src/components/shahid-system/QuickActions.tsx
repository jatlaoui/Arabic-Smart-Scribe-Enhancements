
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Download, 
  Share, 
  Sparkles 
} from 'lucide-react';

interface QuickActionsProps {
  generatedScenes: any[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ generatedScenes }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3 space-x-reverse">
            <Badge variant="secondary" className="flex items-center space-x-1 space-x-reverse">
              <CheckCircle className="w-3 h-3" />
              <span>جاهز للنشر</span>
            </Badge>
            <span className="text-sm text-gray-600">
              {generatedScenes.length} مشهد • تقدير 45 صفحة
            </span>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 ml-1" />
              تصدير الكتاب
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 ml-1" />
              مشاركة
            </Button>
            <Button size="sm">
              <Sparkles className="w-4 h-4 ml-1" />
              نشر للمراجعة
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
