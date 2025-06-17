
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  FileText, 
  Users, 
  Eye, 
  Wand2,
  Download,
  ArrowRight,
  CheckCircle,
  Circle,
  Sparkles,
  BookOpen,
  User,
  Zap
} from 'lucide-react';
import { SmartWritingStudio } from '@/components/writing-studio/SmartWritingStudio';
import { WitnessSystemManager } from '@/components/witness-system/WitnessSystemManager';
import { Project } from '@/lib/api';

interface WritingPhase {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'active' | 'completed';
  progress: number;
  isUnlocked: boolean;
}

interface StudioProject {
  id: string;
  title: string;
  type: 'video-book' | 'smart-writing';
  status: 'draft' | 'in-progress' | 'completed';
  lastModified: string;
  wordCount?: number;
  sourceUrl?: string;
}

interface WritingProject {
  id: string;
  title: string;
  type: 'simple' | 'advanced';
  description: string;
  currentPhase: string;
  overallProgress: number;
  phases: WritingPhase[];
  // API Project properties
  apiProject?: Project;
  // Studio Project properties
  studioProject?: StudioProject;
}

export const UnifiedWritingInterface: React.FC = () => {
  const [userType, setUserType] = useState<'simple' | 'advanced' | null>(null);
  const [currentProject, setCurrentProject] = useState<WritingProject | null>(null);
  const [activePhase, setActivePhase] = useState<string>('idea');

  const simpleWriterPhases: WritingPhase[] = [
    {
      id: 'idea',
      title: 'فكرة الرواية',
      description: 'ابدأ بكتابة فكرتك الأساسية',
      icon: Lightbulb,
      status: 'active',
      progress: 0,
      isUnlocked: true
    },
    {
      id: 'write',
      title: 'الكتابة والتحرير',
      description: 'اكتب روايتك مع المساعد الذكي',
      icon: FileText,
      status: 'pending',
      progress: 0,
      isUnlocked: false
    },
    {
      id: 'export',
      title: 'تصدير الرواية',
      description: 'احصل على روايتك في صيغ مختلفة',
      icon: Download,
      status: 'pending',
      progress: 0,
      isUnlocked: false
    }
  ];

  const advancedWriterPhases: WritingPhase[] = [
    {
      id: 'idea',
      title: 'فكرة الرواية',
      description: 'طور فكرتك مع أدوات التخطيط المتقدمة',
      icon: Lightbulb,
      status: 'active',
      progress: 0,
      isUnlocked: true
    },
    {
      id: 'suggestions',
      title: 'الاقتراحات الذكية',
      description: 'احصل على اقتراحات لتطوير الحبكة والشخصيات',
      icon: Sparkles,
      status: 'pending',
      progress: 0,
      isUnlocked: false
    },
    {
      id: 'witness',
      title: 'استدعاء الشاهد',
      description: 'ادمج المعلومات الحقيقية من الشهادات',
      icon: Eye,
      status: 'pending',
      progress: 0,
      isUnlocked: false
    },
    {
      id: 'construct',
      title: 'بناء المشاهد',
      description: 'حول الشهادات إلى مشاهد أدبية',
      icon: Wand2,
      status: 'pending',
      progress: 0,
      isUnlocked: false
    },
    {
      id: 'write',
      title: 'الكتابة المتقدمة',
      description: 'اكتب مع جميع الأدوات المتقدمة',
      icon: FileText,
      status: 'pending',
      progress: 0,
      isUnlocked: false
    },
    {
      id: 'export',
      title: 'تصدير الرواية',
      description: 'احصل على روايتك الكاملة بتقرير مصادر',
      icon: Download,
      status: 'pending',
      progress: 0,
      isUnlocked: false
    }
  ];

  const createNewProject = (type: 'simple' | 'advanced') => {
    const phases = type === 'simple' ? simpleWriterPhases : advancedWriterPhases;
    
    // Create API-compatible project
    const apiProject: Project = {
      id: Date.now().toString(),
      title: 'مشروع رواية جديد',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      word_count: 0,
      status: 'draft',
      tags: []
    };

    // Create Studio-compatible project
    const studioProject: StudioProject = {
      id: apiProject.id,
      title: apiProject.title,
      type: 'smart-writing',
      status: 'draft',
      lastModified: new Date().toISOString(),
      wordCount: 0
    };

    const newProject: WritingProject = {
      id: apiProject.id,
      title: apiProject.title,
      type,
      description: type === 'simple' ? 'مشروع كتابة بسيط وسريع' : 'مشروع كتابة متقدم مع جميع الأدوات',
      currentPhase: 'idea',
      overallProgress: 0,
      phases,
      apiProject,
      studioProject
    };
    
    setCurrentProject(newProject);
    setUserType(type);
  };

  const updatePhaseProgress = (phaseId: string, progress: number) => {
    if (!currentProject) return;
    
    const updatedPhases = currentProject.phases.map(phase => {
      if (phase.id === phaseId) {
        return { 
          ...phase, 
          progress,
          status: progress === 100 ? 'completed' as const : 'active' as const
        };
      }
      return phase;
    });

    // فتح المرحلة التالية عند اكتمال المرحلة الحالية
    const currentPhaseIndex = updatedPhases.findIndex(p => p.id === phaseId);
    if (progress === 100 && currentPhaseIndex < updatedPhases.length - 1) {
      updatedPhases[currentPhaseIndex + 1].isUnlocked = true;
    }

    const overallProgress = Math.round(
      updatedPhases.reduce((sum, phase) => sum + phase.progress, 0) / updatedPhases.length
    );

    setCurrentProject({
      ...currentProject,
      phases: updatedPhases,
      overallProgress
    });
  };

  const renderWelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            <BookOpen className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              منصة الكتابة الذكية
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            اختر مستوى تجربة الكتابة المناسب لك
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* الكاتب البسيط */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-blue-700">الكاتب البسيط</CardTitle>
              <p className="text-gray-600">مناسب للمبتدئين والكتابة السريعة</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>محرر نصوص بسيط وسهل</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>مساعد كتابة ذكي</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>تصدير فوري للرواية</span>
                </div>
              </div>
              <Button 
                onClick={() => createNewProject('simple')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                ابدأ الكتابة البسيطة
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </CardContent>
          </Card>

          {/* الكاتب المتقدم */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-4 rounded-full">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-purple-700">الكاتب المتقدم</CardTitle>
              <p className="text-gray-600">للكتاب المحترفين والمشاريع المعقدة</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>جميع أدوات الكاتب البسيط</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>نظام استدعاء الشاهد</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>محرك بناء المشاهد الذكي</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>تحليل المصداقية والمراجع</span>
                </div>
              </div>
              <Button 
                onClick={() => createNewProject('advanced')}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                ابدأ الكتابة المتقدمة
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderProgressRoadmap = () => {
    if (!currentProject) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <CardTitle className="text-xl">خريطة الطريق</CardTitle>
              <Badge variant="outline" className={
                currentProject.type === 'simple' ? 'border-blue-500 text-blue-700' : 'border-purple-500 text-purple-700'
              }>
                {currentProject.type === 'simple' ? 'بسيط' : 'متقدم'}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              التقدم الإجمالي: {currentProject.overallProgress}%
            </div>
          </div>
          <Progress value={currentProject.overallProgress} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {currentProject.phases.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = activePhase === phase.id;
              
              return (
                <Card 
                  key={phase.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  } ${
                    !phase.isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                  }`}
                  onClick={() => phase.isUnlocked && setActivePhase(phase.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`p-3 rounded-full ${
                        phase.status === 'completed' ? 'bg-green-100' :
                        phase.status === 'active' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {phase.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Icon className={`w-6 h-6 ${
                            phase.status === 'active' ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{phase.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{phase.description}</p>
                        {phase.progress > 0 && (
                          <div className="mt-2">
                            <Progress value={phase.progress} className="h-1" />
                            <span className="text-xs text-gray-500">{phase.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActivePhaseContent = () => {
    if (!currentProject) return null;

    const currentPhase = currentProject.phases.find(p => p.id === activePhase);
    if (!currentPhase || !currentPhase.isUnlocked) return null;

    switch (activePhase) {
      case 'idea':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Lightbulb className="w-5 h-5" />
                <span>فكرة الرواية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان الرواية</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border rounded-lg"
                    placeholder="اكتب عنوان روايتك هنا..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الفكرة الأساسية</label>
                  <textarea 
                    className="w-full p-3 border rounded-lg h-32"
                    placeholder="اشرح فكرة روايتك في بضعة أسطر..."
                  />
                </div>
                <Button 
                  onClick={() => updatePhaseProgress('idea', 100)}
                  className="w-full"
                >
                  حفظ الفكرة والانتقال للمرحلة التالية
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'suggestions':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Sparkles className="w-5 h-5" />
                <span>الاقتراحات الذكية</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">ستظهر هنا اقتراحات ذكية لتطوير حبكة روايتك</p>
              <Button 
                onClick={() => updatePhaseProgress('suggestions', 100)}
                className="w-full"
              >
                المتابعة إلى استدعاء الشاهد
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </CardContent>
          </Card>
        );

      case 'witness':
        return <WitnessSystemManager />;

      case 'construct':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Wand2 className="w-5 h-5" />
                <span>بناء المشاهد</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">حول الشهادات المستخرجة إلى مشاهد أدبية</p>
              <Button 
                onClick={() => updatePhaseProgress('construct', 100)}
                className="w-full"
              >
                المتابعة إلى الكتابة
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </CardContent>
          </Card>
        );

      case 'write':
        return currentProject.studioProject ? (
          <SmartWritingStudio currentProject={currentProject.studioProject} />
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">جاري تحضير محرر الكتابة...</p>
            </CardContent>
          </Card>
        );

      case 'export':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Download className="w-5 h-5" />
                <span>تصدير الرواية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">اختر صيغة التصدير المناسبة لروايتك</p>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  <span>ملف نصي</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BookOpen className="w-6 h-6 mb-2" />
                  <span>كتاب إلكتروني</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (!userType || !currentProject) {
    return renderWelcomeScreen();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button 
              variant="ghost" 
              onClick={() => {
                setUserType(null);
                setCurrentProject(null);
              }}
            >
              ← العودة للبداية
            </Button>
            <h1 className="text-2xl font-bold">{currentProject.title}</h1>
          </div>
        </div>

        {/* Progress Roadmap */}
        {renderProgressRoadmap()}

        {/* Active Phase Content */}
        {renderActivePhaseContent()}
      </div>
    </div>
  );
};
