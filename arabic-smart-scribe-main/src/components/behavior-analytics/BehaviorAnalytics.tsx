
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  Target, 
  Zap,
  Eye,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

interface UsagePattern {
  tool_name: string;
  usage_count: number;
  success_rate: number;
  average_time: number;
  user_satisfaction: number;
}

interface ProductivityData {
  hour: number;
  words_written: number;
  quality_score: number;
  focus_level: number;
  editing_intensity: number;
}

interface EditingIntelligence {
  edit_type: string;
  count: number;
  effectiveness: number;
  time_saved: number;
  quality_improvement: number;
}

interface BehaviorInsights {
  usage_patterns: UsagePattern[];
  productivity_data: ProductivityData[];
  editing_intelligence: EditingIntelligence[];
  writing_persona: {
    creativity: number;
    technical_accuracy: number;
    emotional_depth: number;
    structural_organization: number;
    vocabulary_sophistication: number;
    narrative_flow: number;
  };
  predictions: {
    next_week_productivity: number;
    optimal_writing_times: number[];
    recommended_focus_areas: string[];
    skill_development_trajectory: Array<{
      skill: string;
      current_level: number;
      projected_growth: number;
    }>;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date_earned: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
}

export const BehaviorAnalytics: React.FC = () => {
  const [behaviorData, setBehaviorData] = useState<BehaviorInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    loadBehaviorData();
  }, [timeRange]);

  const loadBehaviorData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/behavior-analytics?range=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBehaviorData(data);
      }
    } catch (error) {
      console.error('Error loading behavior data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'common': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'أسطوري';
      case 'epic': return 'ملحمي';
      case 'rare': return 'نادر';
      case 'common': return 'عادي';
      default: return 'غير محدد';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">جاري تحليل البيانات</h3>
            <p className="text-gray-600">يرجى الانتظار بينما نحلل أنماط السلوك والتفاعل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!behaviorData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">لا توجد بيانات متاحة</h3>
          <p className="text-gray-600">ابدأ في استخدام النظام لتجميع البيانات اللازمة للتحليل</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Brain className="w-6 h-6 text-blue-600" />
              <span>تحليل السلوك والتفاعل المتقدم</span>
            </CardTitle>
            <div className="flex space-x-2 space-x-reverse">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="week">الأسبوع الماضي</option>
                <option value="month">الشهر الماضي</option>
                <option value="quarter">الربع الماضي</option>
                <option value="year">السنة الماضية</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 ml-1" />
                تصدير التقرير
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="patterns">أنماط الاستخدام</TabsTrigger>
          <TabsTrigger value="intelligence">الذكاء التحريري</TabsTrigger>
          <TabsTrigger value="achievements">الإنجازات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {behaviorData.productivity_data.reduce((sum, data) => sum + data.words_written, 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">كلمات مكتوبة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {behaviorData.editing_intelligence.reduce((sum, data) => sum + data.count, 0)}
                </div>
                <p className="text-sm text-gray-600">تحريرات ذكية</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {Math.round(behaviorData.productivity_data.reduce((sum, data) => sum + data.quality_score, 0) / behaviorData.productivity_data.length * 100)}%
                </div>
                <p className="text-sm text-gray-600">متوسط الجودة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  +{Math.round(behaviorData.predictions.next_week_productivity)}%
                </div>
                <p className="text-sm text-gray-600">نمو متوقع</p>
              </CardContent>
            </Card>
          </div>

          {/* Writing Persona Radar */}
          <Card>
            <CardHeader>
              <CardTitle>الشخصية الكتابية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { skill: 'الإبداع', value: behaviorData.writing_persona.creativity * 100 },
                    { skill: 'الدقة التقنية', value: behaviorData.writing_persona.technical_accuracy * 100 },
                    { skill: 'العمق العاطفي', value: behaviorData.writing_persona.emotional_depth * 100 },
                    { skill: 'التنظيم الهيكلي', value: behaviorData.writing_persona.structural_organization * 100 },
                    { skill: 'تطور المفردات', value: behaviorData.writing_persona.vocabulary_sophistication * 100 },
                    { skill: 'تدفق السرد', value: behaviorData.writing_persona.narrative_flow * 100 }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="القدرات" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Productivity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>الإنتاجية عبر الوقت</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={behaviorData.productivity_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="words_written" stroke="#8884d8" name="الكلمات المكتوبة" />
                    <Line type="monotone" dataKey="quality_score" stroke="#82ca9d" name="نقاط الجودة" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Predictions */}
          <Card>
            <CardHeader>
              <CardTitle>التنبؤات والتوصيات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">أوقات الكتابة المثلى:</h4>
                  <div className="flex space-x-2 space-x-reverse">
                    {behaviorData.predictions.optimal_writing_times.map((hour, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        {hour}:00
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">مجالات التركيز الموصى بها:</h4>
                  <div className="space-y-2">
                    {behaviorData.predictions.recommended_focus_areas.map((area, index) => (
                      <div key={index} className="flex items-center space-x-2 space-x-reverse">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أنماط استخدام الأدوات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={behaviorData.usage_patterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tool_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage_count" fill="#8884d8" name="مرات الاستخدام" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معدلات النجاح للأدوات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorData.usage_patterns.map((pattern, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{pattern.tool_name}</span>
                      <span>{Math.round(pattern.success_rate * 100)}%</span>
                    </div>
                    <Progress value={pattern.success_rate * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Editorial Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>توزيع أنواع التحرير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={behaviorData.editing_intelligence}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ edit_type, percent }) => `${edit_type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {behaviorData.editing_intelligence.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>فعالية التحرير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {behaviorData.editing_intelligence.map((intel, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{intel.edit_type}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>العدد:</span>
                        <span className="font-medium">{intel.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>الفعالية:</span>
                        <span className="font-medium">{Math.round(intel.effectiveness * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>الوقت المُوفر:</span>
                        <span className="font-medium">{intel.time_saved} دقيقة</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>تحسين الجودة:</span>
                        <span className="font-medium">+{Math.round(intel.quality_improvement * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Target className="w-5 h-5" />
                <span>الإنجازات والمعالم</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {behaviorData.achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}>
                    <div className="flex items-center space-x-3 space-x-reverse mb-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-bold">{achievement.title}</h4>
                        <Badge className="text-xs">
                          {getRarityName(achievement.rarity)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{achievement.description}</p>
                    <div className="flex items-center space-x-2 space-x-reverse text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{achievement.date_earned}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
