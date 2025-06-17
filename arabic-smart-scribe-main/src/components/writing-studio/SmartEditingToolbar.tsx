
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  RefreshCw, 
  Expand, 
  Sparkles, 
  CheckCircle,
  X,
  Loader2,
  Heart
} from 'lucide-react';
import { apiClient, EditingTool, EditingRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SmartEditingToolbarProps {
  selectedText: string;
  onEdit: (editedText: string) => void;
  onClose: () => void;
}

const iconMap = {
  RefreshCw,
  Expand, 
  Sparkles,
  CheckCircle,
  Heart,
  Wand2
};

export const SmartEditingToolbar: React.FC<SmartEditingToolbarProps> = ({
  selectedText,
  onEdit,
  onClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedText, setProcessedText] = useState('');
  const [editingTools, setEditingTools] = useState<EditingTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEditingTools();
  }, []);

  const loadEditingTools = async () => {
    try {
      const response = await apiClient.getEditingTools();
      setEditingTools(response.tools);
    } catch (error) {
      console.error('Error loading editing tools:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل أدوات التحرير",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolClick = async (tool: EditingTool) => {
    if (!selectedText.trim()) {
      toast({
        title: "تحذير",
        description: "يرجى تحديد نص للتحرير",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const request: EditingRequest = {
        text: selectedText,
        tool_type: tool.id,
      };

      const response = await apiClient.editText(request);
      setProcessedText(response.edited_text);
      
      toast({
        title: "تم التحرير بنجاح",
        description: `تم تطبيق ${tool.name} على النص`,
      });
    } catch (error) {
      console.error('Error editing text:', error);
      toast({
        title: "خطأ في التحرير",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const applyEdit = () => {
    onEdit(processedText);
    onClose();
    toast({
      title: "تم التطبيق",
      description: "تم تطبيق التعديل على النص",
    });
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
      green: 'bg-green-50 text-green-700 hover:bg-green-100',
      teal: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
      emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      rose: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
      pink: 'bg-pink-50 text-pink-700 hover:bg-pink-100'
    };
    return colorMap[color] || 'bg-gray-50 text-gray-700 hover:bg-gray-100';
  };

  const groupedTools = editingTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, EditingTool[]>);

  const categoryNames = {
    rewrite: 'إعادة الصياغة',
    expand: 'الإطالة',
    enhance: 'التحسين'
  };

  if (isLoading) {
    return (
      <Card className="w-96 shadow-lg border-2 border-blue-200 bg-white">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">جاري تحميل أدوات التحرير...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96 shadow-lg border-2 border-blue-200 bg-white">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Wand2 className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">أدوات التحرير الذكية</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Selected Text Preview */}
        <div className="mb-4">
          <Badge variant="outline" className="mb-2">النص المحدد</Badge>
          <div className="text-sm bg-gray-50 p-3 rounded-lg max-h-20 overflow-y-auto">
            "{selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}"
          </div>
        </div>

        {/* Editing Tools */}
        {!isProcessing && !processedText && (
          <div className="space-y-3">
            {Object.entries(groupedTools).map(([category, tools], index) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {categoryNames[category as keyof typeof categoryNames]}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {tools.map((tool) => {
                    const IconComponent = iconMap[tool.icon as keyof typeof iconMap] || Wand2;
                    return (
                      <Button
                        key={tool.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleToolClick(tool)}
                        className={`justify-start text-right ${getColorClasses(tool.color)}`}
                      >
                        <IconComponent className="w-4 h-4 ml-2" />
                        {tool.name}
                      </Button>
                    );
                  })}
                </div>
                {index < Object.entries(groupedTools).length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">جاري معالجة النص بالذكاء الاصطناعي...</p>
          </div>
        )}

        {/* Result State */}
        {processedText && !isProcessing && (
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2 bg-green-50 text-green-700">النتيجة</Badge>
              <div className="text-sm bg-green-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                {processedText}
              </div>
            </div>
            
            <div className="flex space-x-2 space-x-reverse">
              <Button 
                onClick={applyEdit}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 ml-1" />
                تطبيق التغيير
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setProcessedText('');
                  setIsProcessing(false);
                }}
                className="flex-1"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
