import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  Settings, 
  Activity, 
  MessageSquare, 
  Wrench as Tool, 
  TrendingUp,
  Zap,
  Brain,
  Cpu,
  Workflow,
  Plus,
  RefreshCw,
  Trash,
  Check,
  X,
  Edit,
  Sparkles,
  Play,
  Pause,
  Info,
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  Network,
  LayoutGrid,
  BarChart,
  Lightbulb,
  Wand2
} from 'lucide-react';

// أنواع البيانات
interface Agent {
  id: string;
  agent_id: string;
  name: string;
  type: string;
  description: string;
  avatar_url: string;
  status: string;
  current_status: string;
  active_tasks: number;
  capabilities_json: Record<string, any>;
  configuration_json: Record<string, any>;
  performance_stats_json: Record<string, any>;
  last_activity: string;
}

interface AgentMessage {
  id: string;
  sender_agent_id: string;
  receiver_agent_id: string;
  message_type: string;
  content_json: Record<string, any>;
  timestamp: string;
  status: string;
}

interface Statistics {
  general: {
    total_agents: number;
    active_agents: number;
    idle_agents: number;
    error_agents: number;
  };
  tasks: {
    total_tasks: number;
    running_tasks: number;
    completed_tasks: number;
    failed_tasks: number;
    avg_task_duration: number;
  };
  messages: {
    total_messages: number;
    requests: number;
    responses: number;
    pending_responses: number;
  };
}

// استيراد مكونات استوديو الوكلاء
import AgentChatViewer from '@/components/AgentChatViewer';
import ToolMarketplace from '@/components/ToolMarketplace';

// المكونات الإضافية
const AgentFlowCanvas = React.lazy(() => import('@/components/workflows/AgentFlowCanvas'));

// مؤثرات حركية راقصة للصفحة
const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
};

const cardVariants = {
  initial: { y: 20, opacity: 0 },
  enter: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  hover: { y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)", transition: { duration: 0.2 } }
};

// تأثير تدفق الجسيمات للوكلاء
const AgentParticleEffect: React.FC<{ agentCount: number }> = ({ agentCount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // ضبط حجم الكانفاس
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // إنشاء الجسيمات
    const particles: any[] = [];
    const particleCount = Math.min(100, agentCount * 5);
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        color: `hsla(${Math.random() * 120 + 180}, 80%, 60%, 0.7)`,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        connections: []
      });
    }
    
    // رسم الجسيمات والروابط
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // تحديث مواقع الجسيمات
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // ارتداد من الحدود
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        // رسم الجسيم
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // حساب الروابط
        particle.connections = [];
        particles.forEach(otherParticle => {
          if (particle !== otherParticle) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              particle.connections.push({
                particle: otherParticle,
                distance
              });
            }
          }
        });
        
        // رسم الروابط
        particle.connections.forEach((connection: any) => {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(connection.particle.x, connection.particle.y);
          ctx.strokeStyle = `rgba(100, 200, 255, ${1 - connection.distance / 100})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [agentCount]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 w-full h-full pointer-events-none"
    />
  );
};

const AgentStudio: React.FC = () => {
  // حالة الوكلاء
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // حالة واجهة المستخدم
  const [showCreateAgentDialog, setShowCreateAgentDialog] = useState(false);
  const [showAgentDetailsDialog, setShowAgentDetailsDialog] = useState(false);
  const [showCollaborationDialog, setShowCollaborationDialog] = useState(false);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [agentTypeFilter, setAgentTypeFilter] = useState('all');
  const [isFlowCanvasActive, setIsFlowCanvasActive] = useState(false);
  
  // محركات الرسوم المتحركة
  const statsCardControls = useAnimation();

  // جلب بيانات الوكلاء
  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب الوكلاء:', error);
    }
  };

  // جلب الإحصائيات
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/agents/statistics');
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    }
  };

  // جلب رسائل وكيل محدد
  const fetchAgentMessages = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/messages`);
      const data = await response.json();
      if (data.success) {
        setAgentMessages(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب رسائل الوكيل:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAgents(),
        fetchStatistics()
      ]);
      setLoading(false);
    };

    loadData();

    // تحديث البيانات كل 5 ثواني
    const interval = setInterval(() => {
      fetchAgents();
      fetchStatistics();
      if (selectedAgent) {
        fetchAgentMessages(selectedAgent.agent_id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedAgent]);

  // دالة لتحديد لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-500';
      case 'idle': return 'bg-blue-500';
      case 'waiting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'paused': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  // دالة لتحديد نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'working': return 'يعمل';
      case 'idle': return 'خامل';
      case 'waiting': return 'في انتظار';
      case 'error': return 'خطأ';
      case 'paused': return 'متوقف';
      default: return 'غير معروف';
    }
  };

  // دالة لتحديد أيقونة نوع الوكيل
  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'idea_generator': return <Brain className="w-6 h-6" />;
      case 'chapter_composer': return <Cpu className="w-6 h-6" />;
      case 'literary_critic': return <Zap className="w-6 h-6" />;
      default: return <Users className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <Users className="w-8 h-8" />
            </div>
            استوديو الوكلاء
          </h1>
          <p className="text-gray-600 text-lg">
            مركز التحكم في الوكلاء الذكيين ومراقبة أدائهم
          </p>
        </motion.div>

        {/* إحصائيات سريعة */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">الوكلاء النشطين</p>
                    <p className="text-3xl font-bold">{statistics.general.active_agents}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-100" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">إجمالي الوكلاء</p>
                    <p className="text-3xl font-bold">{statistics.general.total_agents}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-100" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">المهام الجارية</p>
                    <p className="text-3xl font-bold">{statistics.tasks.running_tasks}</p>
                  </div>
                  <Workflow className="w-8 h-8 text-purple-100" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">الرسائل اليوم</p>
                    <p className="text-3xl font-bold">{statistics.messages.total_messages}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-orange-100" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="agents">الوكلاء</TabsTrigger>
            <TabsTrigger value="communications">المحادثات</TabsTrigger>
            <TabsTrigger value="tools">الأدوات</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* قائمة الوكلاء */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    الوكلاء النشطين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {agents.map((agent) => (
                      <motion.div
                        key={agent.agent_id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={agent.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                              {getAgentIcon(agent.type)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(agent.current_status || agent.status)}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                          <p className="text-sm text-gray-600">{agent.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getStatusText(agent.current_status || agent.status)}
                            </Badge>
                            {agent.active_tasks > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {agent.active_tasks} مهام
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* إحصائيات تفصيلية */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    إحصائيات تفصيلية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statistics && (
                    <div className="space-y-6">
                      {/* إحصائيات المهام */}
                      <div>
                        <h4 className="font-semibold mb-3">أداء المهام</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>مكتملة</span>
                            <span className="font-bold text-green-600">{statistics.tasks.completed_tasks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>جارية</span>
                            <span className="font-bold text-blue-600">{statistics.tasks.running_tasks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>فاشلة</span>
                            <span className="font-bold text-red-600">{statistics.tasks.failed_tasks}</span>
                          </div>
                          {statistics.tasks.avg_task_duration && (
                            <div className="flex justify-between">
                              <span>متوسط المدة</span>
                              <span className="font-bold">{Math.round(statistics.tasks.avg_task_duration)} دقيقة</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* إحصائيات المراسلة */}
                      <div>
                        <h4 className="font-semibold mb-3">التواصل</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>طلبات</span>
                            <span className="font-bold text-blue-600">{statistics.messages.requests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ردود</span>
                            <span className="font-bold text-green-600">{statistics.messages.responses}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>في انتظار الرد</span>
                            <span className="font-bold text-orange-600">{statistics.messages.pending_responses}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب الوكلاء */}
          <TabsContent value="agents">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.agent_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={agent.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl">
                                {getAgentIcon(agent.type)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(agent.current_status || agent.status)}`} />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <p className="text-sm text-gray-600">{agent.type}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4 text-sm">{agent.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">الحالة:</span>
                            <Badge 
                              variant="outline" 
                              className={`${getStatusColor(agent.current_status || agent.status)} text-white border-0`}
                            >
                              {getStatusText(agent.current_status || agent.status)}
                            </Badge>
                          </div>
                          
                          {agent.active_tasks > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">المهام النشطة:</span>
                              <Badge variant="secondary">{agent.active_tasks}</Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">آخر نشاط:</span>
                            <span className="text-xs text-gray-500">
                              {new Date(agent.last_activity).toLocaleString('ar-EG')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setActiveTab('communications');
                              fetchAgentMessages(agent.agent_id);
                            }}
                          >
                            <MessageSquare className="w-4 h-4 ml-2" />
                            عرض المحادثات
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* تبويب المحادثات */}
          <TabsContent value="communications">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* قائمة الوكلاء */}
              <Card>
                <CardHeader>
                  <CardTitle>اختر وكيل</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {agents.map((agent) => (
                      <Button
                        key={agent.agent_id}
                        variant={selectedAgent?.agent_id === agent.agent_id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedAgent(agent);
                          fetchAgentMessages(agent.agent_id);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.current_status || agent.status)}`} />
                          <span>{agent.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* عرض المحادثات */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {selectedAgent ? `محادثات ${selectedAgent.name}` : 'اختر وكيل لعرض المحادثات'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAgent ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {agentMessages.length > 0 ? (
                        agentMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.sender_agent_id === selectedAgent.agent_id
                                ? 'bg-blue-50 mr-8'
                                : 'bg-gray-50 ml-8'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {message.sender_agent_id === selectedAgent.agent_id ? 'مرسل' : 'مستقبل'}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {message.message_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">
                              {JSON.stringify(message.content_json, null, 2)}
                            </p>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleString('ar-EG')}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          لا توجد محادثات متاحة
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      اختر وكيل من القائمة لعرض محادثاته
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب الأدوات */}
          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tool className="w-5 h-5" />
                  متجر الأدوات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  متجر الأدوات قيد التطوير...
                  <br />
                  سيتم إضافة واجهة إدارة الأدوات قريباً
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentStudio;
