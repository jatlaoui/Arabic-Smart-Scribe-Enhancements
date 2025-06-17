
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoToBookWorkflow } from './VideoToBookWorkflow';
import { VideoAnalysisPanel } from './VideoAnalysisPanel';
import { BookOutlineGenerator } from './BookOutlineGenerator';
import { ChapterWriter } from './ChapterWriter';
import { AdvancedShahidSystem } from '../shahid-system/AdvancedShahidSystem';
import { AdvancedSettings } from './AdvancedSettings';
import { GeminiAssistant } from './GeminiAssistant';
import { 
  Video, 
  BookOpen, 
  FileText, 
  Save,
  Share,
  Settings,
  Brain,
  Upload,
  Wand2,
  Sparkles
} from 'lucide-react';
import { GlassmorphicCard } from '../advanced-ui/GlassmorphicCard';

interface Project {
  id: string;
  title: string;
  type: 'video-book' | 'smart-writing';
  status: 'draft' | 'in-progress' | 'completed';
  lastModified: string;
  wordCount?: number;
  sourceUrl?: string;
}

interface VideoToBookConverterProps {
  currentProject: Project | null;
}

export const VideoToBookConverter: React.FC<VideoToBookConverterProps> = ({ currentProject }) => {
  const [projectTitle, setProjectTitle] = useState(currentProject?.title || 'كتاب جديد من فيديو');
  const [activeTab, setActiveTab] = useState('workflow');
  const [wordCount, setWordCount] = useState(currentProject?.wordCount || 0);
  const [advancedSettings, setAdvancedSettings] = useState({});
  const [generatedContent, setGeneratedContent] = useState('');

  const handleAdvancedSettingsChange = (settings: any) => {
    setAdvancedSettings(settings);
  };

  const handleContentFromAssistant = (content: string) => {
    setGeneratedContent(content);
    setWordCount(prev => prev + content.split(' ').length);
  };

  return (
    <div className="min-h-screen relative" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Floating Shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-float-delay"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <GlassmorphicCard variant="primary" className="p-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-xl">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="text-xl font-bold border-none p-0 h-auto bg-transparent text-white placeholder:text-white/50"
                  />
                  <div className="flex items-center space-x-4 space-x-reverse text-sm text-white/70 mt-1">
                    <span>{wordCount.toLocaleString()} كلمة</span>
                    <span>•</span>
                    <span>مدعوم بـ Gemini AI</span>
                    <span>•</span>
                    <span>بحث ويب متقدم</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Save className="w-4 h-4 ml-1" />
                  حفظ
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Share className="w-4 h-4 ml-1" />
                  مشاركة
                </Button>
              </div>
            </div>
          </CardHeader>
        </GlassmorphicCard>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-black/20 backdrop-blur-md border border-white/20">
            <TabsTrigger 
              value="workflow" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Wand2 className="w-4 h-4 ml-2" />
              سير العمل التفاعلي
            </TabsTrigger>
            <TabsTrigger 
              value="shahid-system" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Brain className="w-4 h-4 ml-2" />
              نظام الشاهد
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Video className="w-4 h-4 ml-2" />
              تحليل الفيديو
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Sparkles className="w-4 h-4 ml-2" />
              مساعد Gemini
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Settings className="w-4 h-4 ml-2" />
              إعدادات متقدمة
            </TabsTrigger>
            <TabsTrigger 
              value="legacy" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <BookOpen className="w-4 h-4 ml-2" />
              الواجهة التقليدية
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="workflow">
              <GlassmorphicCard className="p-6">
                <VideoToBookWorkflow />
              </GlassmorphicCard>
            </TabsContent>

            <TabsContent value="shahid-system">
              <AdvancedShahidSystem />
            </TabsContent>

            <TabsContent value="analysis">
              <VideoAnalysisPanel videoUrl="" />
            </TabsContent>

            <TabsContent value="assistant">
              <GeminiAssistant 
                onContentGenerated={handleContentFromAssistant}
                context={generatedContent}
              />
            </TabsContent>

            <TabsContent value="settings">
              <AdvancedSettings 
                settings={advancedSettings}
                onSettingsChange={handleAdvancedSettingsChange}
              />
            </TabsContent>

            <TabsContent value="legacy">
              <div className="space-y-6">
                <BookOutlineGenerator 
                  videoInfo={null}
                  outline={null}
                  onGenerateOutline={() => {}}
                />
                <ChapterWriter 
                  outline={null}
                  progress={0}
                  onStartWriting={() => {}}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};



// API Integration لسير عمل الفيديو مع تتبع المهام
const videoAPI = {
  extractTranscript: async (videoUrl: string) => {
    const response = await axios.post('/api/video/extract-transcript', {
      video_url: videoUrl
    });
    return response.data; // returns { task_id }
  },
  
  cleanTranscript: async (transcript: string) => {
    const response = await axios.post('/api/video/clean-transcript', {
      transcript
    });
    return response.data; // returns { task_id }
  },
  
  convertToNarrative: async (cleanTranscript: string, style: string) => {
    const response = await axios.post('/api/video/convert-to-narrative', {
      clean_transcript: cleanTranscript,
      narrative_style: style
    });
    return response.data; // returns { task_id }
  }
};

export const VideoToBookWorkflow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [cleanTranscript, setCleanTranscript] = useState('');
  const [finalNarrative, setFinalNarrative] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('literary');
  
  // تتبع المهمة الحالية
  const { data: taskStatus, isLoading: isTaskRunning } = useTaskTracking(currentTaskId);
  
  // مهمة استخراج النص
  const extractTranscriptMutation = useMutation({
    mutationFn: (url: string) => videoAPI.extractTranscript(url),
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
    }
  });
  
  // مهمة تنظيف النص
  const cleanTranscriptMutation = useMutation({
    mutationFn: (text: string) => videoAPI.cleanTranscript(text),
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
    }
  });
  
  // مهمة التحويل إلى سرد
  const convertToNarrativeMutation = useMutation({
    mutationFn: ({ transcript, style }: {transcript: string, style: string}) => 
      videoAPI.convertToNarrative(transcript, style),
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
    }
  });
  
  // معالجة اكتمال المهام
  useEffect(() => {
    if (taskStatus?.status === 'success') {
      if (currentStep === 1) {
        // اكتمل استخراج النص
        setTranscript(taskStatus.result.transcript);
        setCurrentStep(2);
        setCurrentTaskId(null);
      } else if (currentStep === 2) {
        // اكتمل تنظيف النص
        setCleanTranscript(taskStatus.result.clean_transcript);
        setCurrentStep(3);
        setCurrentTaskId(null);
      } else if (currentStep === 3) {
        // اكتمل التحويل إلى سرد
        setFinalNarrative(taskStatus.result.narrative);
        setCurrentStep(4);
        setCurrentTaskId(null);
      }
    }
  }, [taskStatus, currentStep]);
  
  return (
    <div className="video-to-book-workflow">
      <div className="workflow-header">
        <h1>📹➡️📚 من فيديو إلى كتاب</h1>
        <div className="step-indicator">الخطوة {currentStep} من 4</div>
      </div>
      
      {/* شريط التقدم */}
      {isTaskRunning && taskStatus && (
        <div className="task-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${(taskStatus.current / taskStatus.total) * 100}%`}}
            />
          </div>
          <div className="progress-message">{taskStatus.message}</div>
        </div>
      )}
      
      {/* الخطوة الأولى: إدخال رابط الفيديو */}
      {currentStep === 1 && (
        <div className="step-content">
          <h2>🔗 إدخال رابط الفيديو</h2>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="video-url-input"
          />
          <button 
            onClick={() => extractTranscriptMutation.mutate(videoUrl)}
            disabled={!videoUrl || extractTranscriptMutation.isPending || isTaskRunning}
            className="primary-button"
          >
            {extractTranscriptMutation.isPending || isTaskRunning ? 'جاري الاستخراج...' : 'استخراج النص'}
          </button>
        </div>
      )}
      
      {/* الخطوة الثانية: مراجعة النص المستخرج */}
      {currentStep === 2 && transcript && (
        <div className="step-content">
          <h2>📝 مراجعة النص المستخرج</h2>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={15}
            className="transcript-textarea"
          />
          <button 
            onClick={() => cleanTranscriptMutation.mutate(transcript)}
            disabled={cleanTranscriptMutation.isPending || isTaskRunning}
            className="primary-button"
          >
            {cleanTranscriptMutation.isPending || isTaskRunning ? 'جاري التنظيف...' : 'تنظيف وتحسين النص'}
          </button>
        </div>
      )}
      
      {/* الخطوة الثالثة: اختيار أسلوب السرد */}
      {currentStep === 3 && cleanTranscript && (
        <div className="step-content">
          <h2>🎨 اختيار أسلوب السرد</h2>
          <div className="clean-transcript-preview">
            <h3>النص المنظف:</h3>
            <div className="text-preview">{cleanTranscript.substring(0, 500)}...</div>
          </div>
          <div className="style-selection">
            <label>
              <input
                type="radio"
                name="style"
                value="literary"
                checked={selectedStyle === 'literary'}
                onChange={(e) => setSelectedStyle(e.target.value)}
              />
              أدبي رفيع
            </label>
            <label>
              <input
                type="radio"
                name="style"
                value="dramatic"
                checked={selectedStyle === 'dramatic'}
                onChange={(e) => setSelectedStyle(e.target.value)}
              />
              درامي مشوق
            </label>
            <label>
              <input
                type="radio"
                name="style"
                value="documentary"
                checked={selectedStyle === 'documentary'}
                onChange={(e) => setSelectedStyle(e.target.value)}
              />
              وثائقي
            </label>
          </div>
          <button 
            onClick={() => convertToNarrativeMutation.mutate({transcript: cleanTranscript, style: selectedStyle})}
            disabled={convertToNarrativeMutation.isPending || isTaskRunning}
            className="primary-button"
          >
            {convertToNarrativeMutation.isPending || isTaskRunning ? 'جاري التحويل...' : 'تحويل إلى سرد'}
          </button>
        </div>
      )}
      
      {/* الخطوة الرابعة: النتيجة النهائية */}
      {currentStep === 4 && finalNarrative && (
        <div className="step-content">
          <h2>📖 الرواية النهائية</h2>
          <div className="final-narrative">
            <pre>{finalNarrative}</pre>
          </div>
          <div className="action-buttons">
            <button className="download-button">تحميل كملف PDF</button>
            <button className="share-button">مشاركة</button>
            <button className="edit-button">تحرير إضافي</button>
          </div>
        </div>
      )}
    </div>
  );
};
