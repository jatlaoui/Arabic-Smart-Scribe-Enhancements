
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  TrendingUp, 
  Users, 
  FileText, 
  Brain,
  Zap,
  Target,
  Award,
  Calendar,
  Activity
} from 'lucide-react';
import { GlassmorphicCard } from '../advanced-ui/GlassmorphicCard';

export const PremiumDashboard: React.FC = () => {
  const [stats] = useState({
    wordsWritten: 12540,
    projectsCompleted: 28,
    timesSaved: 156,
    accuracyRate: 94
  });

  const recentProjects = [
    { id: 1, title: 'مقال عن الذكاء الاصطناعي', progress: 100, date: '2024-01-15' },
    { id: 2, title: 'تقرير سوق العقارات', progress: 75, date: '2024-01-14' },
    { id: 3, title: 'قصة قصيرة للأطفال', progress: 45, date: '2024-01-13' }
  ];

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <GlassmorphicCard variant="primary" className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 space-x-reverse mb-2">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold text-white">لوحة التحكم الاحترافية</h1>
              <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400/30">
                PREMIUM
              </Badge>
            </div>
            <p className="text-white/80">مرحباً بك في نظام الكتابة الذكية المتطور</p>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-white">{new Date().toLocaleDateString('ar-SA')}</div>
            <div className="text-white/60">التاريخ الهجري</div>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassmorphicCard className="p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.wordsWritten.toLocaleString()}</div>
              <div className="text-white/60 text-sm">كلمة مكتوبة</div>
            </div>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
              <TrendingUp className="w-3 h-3 ml-1" />
              +15% هذا الشهر
            </Badge>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-green-500/20 rounded-full">
              <Target className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.projectsCompleted}</div>
              <div className="text-white/60 text-sm">مشروع مكتمل</div>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-200">
              <Award className="w-3 h-3 ml-1" />
              إنجاز عالي
            </Badge>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.timesSaved}</div>
              <div className="text-white/60 text-sm">ساعة موفرة</div>
            </div>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
              <Activity className="w-3 h-3 ml-1" />
              كفاءة عالية
            </Badge>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-yellow-500/20 rounded-full">
              <Brain className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.accuracyRate}%</div>
              <div className="text-white/60 text-sm">معدل الدقة</div>
            </div>
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-200">
              <Crown className="w-3 h-3 ml-1" />
              ممتاز
            </Badge>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassmorphicCard className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-white flex items-center space-x-2 space-x-reverse">
                <FileText className="w-5 h-5" />
                <span>المشاريع الحديثة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{project.title}</h4>
                    <Badge variant="outline" className="border-white/20 text-white/70">
                      <Calendar className="w-3 h-3 ml-1" />
                      {project.date}
                    </Badge>
                  </div>
                  <Progress value={project.progress} className="mb-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">{project.progress}% مكتمل</span>
                    <span className="text-white/60">{project.progress === 100 ? 'مكتمل' : 'قيد العمل'}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </GlassmorphicCard>
        </div>

        <div>
          <GlassmorphicCard variant="secondary" className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-white flex items-center space-x-2 space-x-reverse">
                <Brain className="w-5 h-5" />
                <span>ميزات ذكية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-3">
                <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Zap className="w-4 h-4 ml-2" />
                  كتابة تلقائية سريعة
                </Button>
                <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Target className="w-4 h-4 ml-2" />
                  تحسين النصوص
                </Button>
                <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Award className="w-4 h-4 ml-2" />
                  تحليل الأسلوب
                </Button>
                <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Users className="w-4 h-4 ml-2" />
                  مشاركة المشاريع
                </Button>
              </div>
            </CardContent>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};
