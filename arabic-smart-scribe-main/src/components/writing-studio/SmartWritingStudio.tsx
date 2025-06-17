import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartTextEditor } from './SmartTextEditor';
import { WritingAssistant } from './WritingAssistant';
import { StyleAnalyzer } from './StyleAnalyzer';
import { SmartTextController } from '../text-control/SmartTextController';
import { AdvancedTextAnalysis } from '../text-analysis/AdvancedTextAnalysis';
import { InstantSmartSuggestions } from '../smart-suggestions/InstantSmartSuggestions';
import { 
  Pen, 
  Brain, 
  Palette, 
  Plus,
  Save,
  Share,
  Settings,
  BarChart3,
  Lightbulb,
  Wand2
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  type: 'video-book' | 'smart-writing';
  status: 'draft' | 'in-progress' | 'completed';
  lastModified: string;
  wordCount?: number;
  sourceUrl?: string;
}

interface SmartWritingStudioProps {
  currentProject: Project | null;
}

export const SmartWritingStudio: React.FC<SmartWritingStudioProps> = ({ currentProject }) => {
  const [projectTitle, setProjectTitle] = useState(currentProject?.title || 'مشروع كتابة جديد');
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showAssistant, setShowAssistant] = useState(true);
  const [showStyleAnalyzer, setShowStyleAnalyzer] = useState(true);
  const [showTextController, setShowTextController] = useState(false);
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  const [activeStudioTab, setActiveStudioTab] = useState('editor');

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setWordCount(newContent.split(/\s+/).filter(word => word.length > 0).length);
  };

  const handleSuggestionApply = (suggestion: any) => {
    // Apply suggestion to content
    console.log('Applying suggestion:', suggestion);
  };

  const handleTextImprovement = (originalText: string, improvedText: string) => {
    const updatedContent = content.replace(originalText, improvedText);
    setContent(updatedContent);
    setWordCount(updatedContent.split(/\s+/).filter(word => word.length > 0).length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Pen className="w-6 h-6 text-white" />
              </div>
              <div>
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="text-xl font-bold border-none p-0 h-auto bg-transparent"
                />
                <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600 mt-1">
                  <span>{wordCount.toLocaleString()} كلمة</span>
                  <span>•</span>
                  <span>آخر حفظ: منذ دقيقتين</span>
                  <span>•</span>
                  <span>مسودة</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 ml-1" />
                حفظ
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 ml-1" />
                مشاركة
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 ml-1" />
                إعدادات
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Smart Text Controller Modal */}
      {showTextController && selectedText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <SmartTextController
              selectedText={selectedText}
              onTextChange={(newText) => {
                const updatedContent = content.replace(selectedText, newText);
                setContent(updatedContent);
                setWordCount(updatedContent.split(/\s+/).filter(word => word.length > 0).length);
                setShowTextController(false);
              }}
              onClose={() => setShowTextController(false)}
            />
          </div>
        </div>
      )}

      {/* Studio Tabs */}
      <Tabs value={activeStudioTab} onValueChange={setActiveStudioTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor" className="flex items-center space-x-2 space-x-reverse">
            <Pen className="w-4 h-4" />
            <span>المحرر</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center space-x-2 space-x-reverse">
            <BarChart3 className="w-4 h-4" />
            <span>التحليل المتقدم</span>
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center space-x-2 space-x-reverse">
            <Lightbulb className="w-4 h-4" />
            <span>الاقتراحات الذكية</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center space-x-2 space-x-reverse">
            <Wand2 className="w-4 h-4" />
            <span>الأدوات المتقدمة</span>
          </TabsTrigger>
        </TabsList>

        {/* Editor Tab */}
        <TabsContent value="editor">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Writing Assistant Panel */}
            {showAssistant && (
              <div className="lg:col-span-1">
                <WritingAssistant 
                  content={content}
                  onSuggestion={(suggestion) => {
                    setContent(content + '\n\n' + suggestion);
                  }}
                />
              </div>
            )}

            {/* Main Editor */}
            <div className={`${showAssistant && showStyleAnalyzer ? 'lg:col-span-2' : showAssistant || showStyleAnalyzer ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <SmartTextEditor 
                content={content}
                onChange={handleContentChange}
                placeholder="ابدأ في الكتابة هنا... يمكنك تحديد أي نص لاستخدام أدوات التحرير الذكية"
              />
            </div>

            {/* Style Analyzer Panel */}
            {showStyleAnalyzer && (
              <div className="lg:col-span-1">
                <StyleAnalyzer 
                  content={content}
                  onStyleChange={(newStyle) => {
                    console.log('Style change requested:', newStyle);
                  }}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Advanced Analysis Tab */}
        <TabsContent value="analysis">
          <AdvancedTextAnalysis 
            content={content}
            onSuggestionApply={handleSuggestionApply}
          />
        </TabsContent>

        {/* Smart Suggestions Tab */}
        <TabsContent value="suggestions">
          <InstantSmartSuggestions
            content={content}
            selectedText={selectedText}
            onSuggestionApply={handleSuggestionApply}
            onTextImprovement={handleTextImprovement}
          />
        </TabsContent>

        {/* Advanced Tools Tab */}
        <TabsContent value="tools">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Wand2 className="w-5 h-5" />
                  <span>أدوات التحرير المتقدمة</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowTextController(true)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Brain className="w-4 h-4 ml-2" />
                    التحكم الذكي بطول النص
                  </Button>
                  <Button 
                    onClick={() => setShowAdvancedAnalysis(!showAdvancedAnalysis)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <BarChart3 className="w-4 h-4 ml-2" />
                    تحليل النص الشامل
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Lightbulb className="w-4 h-4 ml-2" />
                    مولد الأفكار الذكي
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات النص</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>عدد الكلمات:</span>
                    <span className="font-semibold">{wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد الأحرف:</span>
                    <span className="font-semibold">{content.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد الفقرات:</span>
                    <span className="font-semibold">{content.split('\n\n').filter(p => p.trim().length > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>وقت القراءة المقدر:</span>
                    <span className="font-semibold">{Math.max(1, Math.ceil(wordCount / 200))} دقيقة</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2 space-x-reverse">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 ml-1" />
                فصل جديد
              </Button>
              <Button variant="outline" size="sm">
                <Brain className="w-4 h-4 ml-1" />
                اقتراحات ذكية
              </Button>
              <Button variant="outline" size="sm">
                <Palette className="w-4 h-4 ml-1" />
                تحليل الأسلوب
              </Button>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAssistant(!showAssistant)}
                className={showAssistant ? 'bg-blue-50 text-blue-600' : ''}
              >
                مساعد الكتابة
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStyleAnalyzer(!showStyleAnalyzer)}
                className={showStyleAnalyzer ? 'bg-purple-50 text-purple-600' : ''}
              >
                محلل الأسلوب
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
                className={showSmartSuggestions ? 'bg-green-50 text-green-600' : ''}
              >
                الاقتراحات الذكية
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
