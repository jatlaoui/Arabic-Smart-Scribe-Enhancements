import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Film, 
  Users, 
  Sparkles, 
  TrendingUp,
  Settings,
  Lightbulb,
  Target,
  Zap,
  Palette,
  Bell,
  Eye,
  RefreshCw,
  Play,
  ArrowRight
} from 'lucide-react';

// استيراد المكونات الجديدة
import AdaptiveLearningSystem from '../components/intelligence/AdaptiveLearningSystem';
import EnhancedNovelDirector from '../components/novel/EnhancedNovelDirector';
import DeepAgentIntelligence from '../components/agents/DeepAgentIntelligence';
import EnhancedUserExperience from '../components/experience/EnhancedUserExperience';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'beta' | 'new';
  progress: number;
  component: React.ComponentType;
}

const PhaseTwo_EnhancementsPage: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string>('overview');

  const features: FeatureCard[] = [
    {
      id: 'adaptive-learning',
      title: 'نظام التعلم التكيفي المتقدم',
      description: 'يتعلم من تعديلاتك ويحسن اقتراحاته تلقائياً',
      icon: <Brain className="h-6 w-6" />,
      status: 'new',
      progress: 95,
      component: AdaptiveLearningSystem
    },
    {
      id: 'novel-director',
      title: 'المدير الفني للرواية المحسن',
      description: 'عقد قابلة للتخصيص وأدوات تحكم متقدمة',
      icon: <Film className="h-6 w-6" />,
      status: 'active',
      progress: 88,
      component: EnhancedNovelDirector
    },
    {
      id: 'agent-intelligence',
      title: 'ذكاء الوكلاء المعمق',
      description: 'تعاون ذكي بين الوكلاء والتفاوض على أفضل الحلول',
      icon: <Users className="h-6 w-6" />,
      status: 'beta',
      progress: 92,
      component: DeepAgentIntelligence
    },
    {
      id: 'user-experience',
      title: 'تجربة المستخدم التفاعلية المحسنة',
      description: 'واجهة مخصصة ومؤشرات بصرية غنية',
      icon: <Sparkles className="h-6 w-6" />,
      status: 'active',
      progress: 90,
      component: EnhancedUserExperience
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'beta': return 'تجريبي';
      case 'new': return 'جديد';
      default: return 'غير محدد';
    }
  };

  const renderActiveComponent = () => {
    const feature = features.find(f => f.id === activeFeature);
    if (feature) {
      const Component = feature.component;
      return <Component />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      {activeFeature === 'overview' ? (
        // صفحة العرض العام
        <div className="p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl">
                <TrendingUp className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              المرحلة الثانية: تحسينات الميزات والذكاء
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              اكتشف التحسينات المتقدمة التي تعمق الذكاء وتثري التفاعل وتوسع القدرات 
              للوصول لمستوى احترافي متقدم في النظام الذكي للكتابة العربية
            </p>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-gray-900">4</div>
                <div className="text-sm text-gray-600">أنظمة ذكية جديدة</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900">91%</div>
                <div className="text-sm text-gray-600">متوسط الأداء</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">ميزة محسنة</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">تخصيص شامل</div>
              </CardContent>
            </Card>
          </div>

          {/* الميزات الرئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card 
                key={feature.id} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveFeature(feature.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {feature.title}
                        </CardTitle>
                        <Badge className={getStatusColor(feature.status)}>
                          {getStatusText(feature.status)}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>مستوى الإكمال</span>
                      <span className="font-medium">{feature.progress}%</span>
                    </div>
                    <Progress value={feature.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ميزات إضافية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-bold mb-2">التعلم من التعديلات</h3>
                <p className="text-sm text-gray-600">
                  النظام يتعلم من كل تعديل تقوم به ويحسن اقتراحاته
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-bold mb-2">تعاون الوكلاء</h3>
                <p className="text-sm text-gray-600">
                  الوكلاء يتفاوضون فيما بينهم للوصول لأفضل النتائج
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <Palette className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-bold mb-2">تخصيص شامل</h3>
                <p className="text-sm text-gray-600">
                  تحكم كامل في الألوان والخطوط والتأثيرات
                </p>
              </CardContent>
            </Card>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => setActiveFeature('adaptive-learning')}
            >
              <Play className="h-5 w-5" />
              استكشاف التحسينات
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Settings className="h-5 w-5" />
              إعدادات النظام
            </Button>
          </div>
        </div>
      ) : (
        // عرض المكون المحدد
        <div className="relative">
          {/* شريط التنقل العلوي */}
          <div className="bg-white border-b p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveFeature('overview')}
                  className="gap-2"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  العودة للعرض العام
                </Button>
                
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">
                    {features.find(f => f.id === activeFeature)?.title}
                  </h2>
                  <Badge className={getStatusColor(features.find(f => f.id === activeFeature)?.status || '')}>
                    {getStatusText(features.find(f => f.id === activeFeature)?.status || '')}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                {features.map((feature) => (
                  <Button
                    key={feature.id}
                    variant={activeFeature === feature.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFeature(feature.id)}
                    className="gap-2"
                  >
                    {feature.icon}
                    <span className="hidden md:inline">{feature.title.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* المكون النشط */}
          <div className="p-0">
            {renderActiveComponent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseTwo_EnhancementsPage;
