
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Video, Settings, BookOpen, Pen, Brain, BarChart3, Sparkles, TrendingUp, Users, Clock, Zap, Award, Target } from 'lucide-react';
import { VideoToBookConverter } from './video-to-book/VideoToBookConverter';
import { SmartWritingStudio } from './writing-studio/SmartWritingStudio';
import { ProjectManager } from './project-manager/ProjectManager';
import { StyleControlCenter } from './style-control/StyleControlCenter';
import { BehaviorAnalytics } from './behavior-analytics/BehaviorAnalytics';
import { GradientCard } from './modern-ui/GradientCard';
import { StatsCard } from './modern-ui/StatsCard';
import { ModernButton } from './modern-ui/ModernButton';
import { ModernTabs, ModernTabsList, ModernTabTrigger, ModernTabContent } from './modern-ui/ModernTabs';

interface LocalProject {
  id: string;
  title: string;
  type: 'video-book' | 'smart-writing';
  status: 'draft' | 'in-progress' | 'completed';
  lastModified: string;
  wordCount?: number;
  sourceUrl?: string;
}

export const ShahidProfessionalApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentProject, setCurrentProject] = useState<LocalProject | null>(null);
  const [projects] = useState<LocalProject[]>([
    {
      id: '1',
      title: 'كتاب من محاضرة الذكاء الاصطناعي',
      type: 'video-book',
      status: 'completed',
      lastModified: '2024-06-15',
      wordCount: 45000,
      sourceUrl: 'https://youtube.com/watch?v=example'
    },
    {
      id: '2',
      title: 'رواية الصحراء الرقمية',
      type: 'smart-writing',
      status: 'in-progress',
      lastModified: '2024-06-14',
      wordCount: 23000
    },
    {
      id: '3',
      title: 'دليل التسويق الرقمي من ندوة الخبراء',
      type: 'video-book',
      status: 'in-progress',
      lastModified: '2024-06-13',
      wordCount: 18000,
      sourceUrl: 'https://youtube.com/watch?v=example2'
    },
    {
      id: '4',
      title: 'قصص قصيرة من الذاكرة',
      type: 'smart-writing',
      status: 'draft',
      lastModified: '2024-06-12',
      wordCount: 8500
    }
  ]);

  const createNewProject = (type: 'video-book' | 'smart-writing') => {
    const newProject: LocalProject = {
      id: Date.now().toString(),
      title: type === 'video-book' ? 'مشروع كتاب جديد من فيديو' : 'مشروع كتابة ذكية جديد',
      type,
      status: 'draft',
      lastModified: new Date().toISOString().split('T')[0],
      wordCount: 0
    };
    setCurrentProject(newProject);
    setActiveTab(type === 'video-book' ? 'video-converter' : 'writing-studio');
  };

  const getStatusColor = (status: LocalProject['status']) => {
    switch (status) {
      case 'draft': return 'bg-orange-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: LocalProject['status']) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'in-progress': return 'قيد العمل';
      case 'completed': return 'مكتمل';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" dir="rtl">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  الشاهد الاحترافي
                </h1>
                <p className="text-gray-600 font-medium">نظام الكتابة الذكية المتكامل - الإصدار 3.0</p>
              </div>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <ModernButton 
                variant="accent"
                icon={<Video className="w-5 h-5" />}
                onClick={() => createNewProject('video-book')}
              >
                فيديو إلى كتاب
              </ModernButton>
              <ModernButton 
                variant="primary"
                icon={<Pen className="w-5 h-5" />}
                onClick={() => createNewProject('smart-writing')}
              >
                كتابة ذكية جديدة
              </ModernButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <ModernTabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <ModernTabsList className="grid-cols-6">
            <ModernTabTrigger value="dashboard" icon={<BarChart3 />} label="لوحة التحكم" badge={4} />
            <ModernTabTrigger value="video-converter" icon={<Video />} label="محول الفيديو" />
            <ModernTabTrigger value="writing-studio" icon={<Pen />} label="استوديو الكتابة" />
            <ModernTabTrigger value="projects" icon={<BookOpen />} label="المشاريع" />
            <ModernTabTrigger value="analytics" icon={<TrendingUp />} label="التحليلات المتقدمة" />
            <ModernTabTrigger value="style-control" icon={<Settings />} label="التحكم في الأسلوب" />
          </ModernTabsList>

          {/* Dashboard */}
          <ModernTabContent value="dashboard" className="space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="إجمالي المشاريع"
                value={projects.length}
                change="+2 هذا الأسبوع"
                icon={<FileText className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                trend="up"
              />
              <StatsCard
                title="المشاريع المكتملة"
                value={projects.filter(p => p.status === 'completed').length}
                change="معدل إنجاز 87%"
                icon={<Award className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-r from-green-500 to-emerald-500"
                trend="up"
              />
              <StatsCard
                title="إجمالي الكلمات"
                value={projects.reduce((sum, p) => sum + (p.wordCount || 0), 0).toLocaleString()}
                change="+12,500 هذا الشهر"
                icon={<Target className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                trend="up"
              />
              <StatsCard
                title="تحريرات ذكية"
                value="1,247"
                change="كفاءة 92%"
                icon={<Zap className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-r from-orange-500 to-red-500"
                trend="up"
              />
            </div>

            {/* Recent Projects */}
            <GradientCard
              title="المشاريع الأخيرة"
              description="آخر التحديثات على مشاريعك"
              icon={<Clock className="w-6 h-6 text-white" />}
              gradient="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              <div className="space-y-4">
                {projects.slice(0, 4).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-6 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className={`p-3 rounded-xl ${project.type === 'video-book' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-purple-500'}`}>
                        {project.type === 'video-book' ? 
                          <Video className="w-6 h-6 text-white" /> : 
                          <Pen className="w-6 h-6 text-white" />
                        }
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{project.title}</h3>
                        <p className="text-gray-600">
                          آخر تعديل: {project.lastModified} • {project.wordCount?.toLocaleString()} كلمة
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Badge className={`${getStatusColor(project.status)} text-white px-3 py-1 font-medium`}>
                        {getStatusText(project.status)}
                      </Badge>
                      <ModernButton 
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setCurrentProject(project);
                          setActiveTab(project.type === 'video-book' ? 'video-converter' : 'writing-studio');
                        }}
                      >
                        فتح
                      </ModernButton>
                    </div>
                  </div>
                ))}
              </div>
            </GradientCard>

            {/* Quick Actions */}
            <GradientCard
              title="إجراءات سريعة"
              description="ابدأ مشروعاً جديداً أو تصفح الأدوات"
              icon={<Sparkles className="w-6 h-6 text-white" />}
              gradient="bg-gradient-to-r from-pink-500 to-rose-500"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <ModernButton 
                  variant="primary"
                  onClick={() => createNewProject('smart-writing')}
                  className="h-24 flex flex-col space-y-3"
                >
                  <Pen className="w-8 h-8" />
                  <span>كتابة جديدة</span>
                </ModernButton>
                <ModernButton 
                  variant="accent"
                  onClick={() => createNewProject('video-book')}
                  className="h-24 flex flex-col space-y-3"
                >
                  <Video className="w-8 h-8" />
                  <span>تحويل فيديو</span>
                </ModernButton>
                <ModernButton 
                  variant="warning"
                  onClick={() => setActiveTab('analytics')}
                  className="h-24 flex flex-col space-y-3"
                >
                  <BarChart3 className="w-8 h-8" />
                  <span>عرض التحليلات</span>
                </ModernButton>
                <ModernButton 
                  variant="success"
                  onClick={() => setActiveTab('projects')}
                  className="h-24 flex flex-col space-y-3"
                >
                  <BookOpen className="w-8 h-8" />
                  <span>إدارة المشاريع</span>
                </ModernButton>
              </div>
            </GradientCard>
          </ModernTabContent>

          {/* Other Tabs Content */}
          <ModernTabContent value="video-converter">
            <VideoToBookConverter currentProject={currentProject} />
          </ModernTabContent>

          <ModernTabContent value="writing-studio">
            <SmartWritingStudio currentProject={currentProject} />
          </ModernTabContent>

          <ModernTabContent value="projects">
            <ProjectManager 
              projects={projects} 
              onOpenProject={(project) => {
                setCurrentProject(project);
                setActiveTab(project.type === 'video-book' ? 'video-converter' : 'writing-studio');
              }}
            />
          </ModernTabContent>

          <ModernTabContent value="analytics">
            <BehaviorAnalytics />
          </ModernTabContent>

          <ModernTabContent value="style-control">
            <StyleControlCenter />
          </ModernTabContent>
        </ModernTabs>
      </main>
    </div>
  );
};
