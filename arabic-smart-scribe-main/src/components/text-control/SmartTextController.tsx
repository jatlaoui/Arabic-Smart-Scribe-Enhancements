
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Expand, 
  FileText, 
  Sparkles, 
  Eye,
  CheckCircle,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Brain,
  Wand2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SmartTextControllerProps {
  selectedText: string;
  onTextChange: (newText: string) => void;
  onClose: () => void;
}

interface TextAnalysis {
  quality_score: number;
  readability: number;
  complexity_level: string;
  word_count: number;
  sentence_count: number;
  paragraph_count: number;
  estimated_reading_time: number;
  style_analysis: {
    tone: string;
    formality: string;
    emotional_intensity: number;
  };
  issues: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suggestions: string[];
}

interface EditResult {
  original_text: string;
  edited_text: string;
  edit_type: string;
  quality_improvement: number;
  changes_summary: string[];
  confidence_score: number;
}

export const SmartTextController: React.FC<SmartTextControllerProps> = ({
  selectedText,
  onTextChange,
  onClose
}) => {
  const [currentText, setCurrentText] = useState(selectedText);
  const [editResult, setEditResult] = useState<EditResult | null>(null);
  const [textAnalysis, setTextAnalysis] = useState<TextAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetLength, setTargetLength] = useState(100);
  const [selectedEditType, setSelectedEditType] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const editTypes = [
    { id: 'expand', name: 'إطالة', icon: Expand, color: 'bg-blue-500', description: 'توسيع النص مع الحفاظ على الجودة' },
    { id: 'summarize', name: 'تلخيص', icon: TrendingDown, color: 'bg-green-500', description: 'تقصير ذكي يحافظ على المعنى' },
    { id: 'improve', name: 'تحسين', icon: TrendingUp, color: 'bg-purple-500', description: 'تحسين جودة النص وأسلوبه' },
    { id: 'rephrase', name: 'إعادة صياغة', icon: RotateCcw, color: 'bg-orange-500', description: 'إعادة كتابة بأسلوب جديد' },
    { id: 'simplify', name: 'تبسيط', icon: FileText, color: 'bg-teal-500', description: 'جعل النص أكثر بساطة ووضوحاً' },
    { id: 'enhance', name: 'تعزيز', icon: Sparkles, color: 'bg-pink-500', description: 'إضافة عمق وثراء للنص' }
  ];

  useEffect(() => {
    if (selectedText && selectedText.trim().length > 0) {
      analyzeText();
    }
  }, [selectedText]);

  const analyzeText = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: currentText,
          analysis_type: 'comprehensive'
        }),
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setTextAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performEdit = async (editType: string) => {
    if (!currentText.trim()) {
      toast({
        title: "تحذير",
        description: "يرجى تحديد نص للتحرير",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setSelectedEditType(editType);

    try {
      const response = await apiClient.editText({
        text: currentText,
        tool_type: editType,
        target_length: editType === 'expand' || editType === 'summarize' ? targetLength : undefined,
        context: 'smart_length_control'
      });

      const result: EditResult = {
        original_text: currentText,
        edited_text: response.edited_text,
        edit_type: editType,
        quality_improvement: response.confidence_score - 0.7,
        changes_summary: response.suggestions,
        confidence_score: response.confidence_score
      };

      setEditResult(result);
      setShowPreview(true);
      
      toast({
        title: "تم التحرير بنجاح",
        description: `تم تطبيق ${editTypes.find(t => t.id === editType)?.name} على النص`,
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

  const applyChanges = () => {
    if (editResult) {
      onTextChange(editResult.edited_text);
      onClose();
      toast({
        title: "تم التطبيق",
        description: "تم تطبيق التعديلات على النص بنجاح",
      });
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Brain className="w-6 h-6 text-blue-600" />
              <span>التحكم الذكي بطول النص</span>
            </CardTitle>
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          {/* Text Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <BarChart3 className="w-5 h-5" />
                <span>تحليل النص</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">جاري تحليل النص...</p>
                </div>
              ) : textAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getQualityColor(textAnalysis.quality_score)}`}>
                        {Math.round(textAnalysis.quality_score * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">جودة النص</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getQualityColor(textAnalysis.readability)}`}>
                        {Math.round(textAnalysis.readability * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">قابلية القراءة</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">{textAnalysis.word_count}</span>
                      <p className="text-gray-600">كلمة</p>
                    </div>
                    <div>
                      <span className="font-semibold">{textAnalysis.sentence_count}</span>
                      <p className="text-gray-600">جملة</p>
                    </div>
                    <div>
                      <span className="font-semibold">{textAnalysis.estimated_reading_time}</span>
                      <p className="text-gray-600">دقيقة</p>
                    </div>
                  </div>

                  {textAnalysis.issues.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">المشاكل المكتشفة</h4>
                        <div className="space-y-2">
                          {textAnalysis.issues.slice(0, 3).map((issue, index) => (
                            <Badge key={index} className={getSeverityColor(issue.severity)}>
                              {issue.description}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد بيانات تحليل متاحة</p>
              )}
            </CardContent>
          </Card>

          {/* Edit Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Wand2 className="w-5 h-5" />
                <span>أدوات التحرير</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Length Control for Expand/Summarize */}
                {(selectedEditType === 'expand' || selectedEditType === 'summarize') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      الطول المستهدف: {targetLength}%
                    </label>
                    <Slider
                      value={[targetLength]}
                      onValueChange={(value) => setTargetLength(value[0])}
                      max={200}
                      min={50}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50%</span>
                      <span>100%</span>
                      <span>200%</span>
                    </div>
                  </div>
                )}

                {/* Edit Type Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {editTypes.map((editType) => {
                    const IconComponent = editType.icon;
                    return (
                      <Button
                        key={editType.id}
                        variant={selectedEditType === editType.id ? "default" : "outline"}
                        className="flex flex-col h-auto p-4 space-y-2"
                        onClick={() => performEdit(editType.id)}
                        disabled={isProcessing}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-sm font-medium">{editType.name}</span>
                        <span className="text-xs text-gray-500 text-center">{editType.description}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          {/* Original Text */}
          <Card>
            <CardHeader>
              <CardTitle>النص الأصلي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto text-sm">
                {currentText}
              </div>
            </CardContent>
          </Card>

          {/* Processing State */}
          {isProcessing && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">جاري معالجة النص</h3>
                  <p className="text-gray-600">يرجى الانتظار بينما نطبق التحسينات الذكية...</p>
                  <Progress value={33} className="mt-4" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Result Preview */}
          {editResult && showPreview && !isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>النتيجة المُحسّنة</span>
                  <Badge className="bg-green-100 text-green-800">
                    تحسن: +{Math.round(editResult.quality_improvement * 100)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg max-h-40 overflow-y-auto text-sm">
                    {editResult.edited_text}
                  </div>

                  {editResult.changes_summary.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">ملخص التغييرات:</h4>
                      <ul className="text-sm space-y-1">
                        {editResult.changes_summary.slice(0, 3).map((change, index) => (
                          <li key={index} className="flex items-center space-x-2 space-x-reverse">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex space-x-2 space-x-reverse">
                    <Button onClick={applyChanges} className="flex-1">
                      <CheckCircle className="w-4 h-4 ml-1" />
                      تطبيق التغييرات
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPreview(false)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      إخفاء المعاينة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
