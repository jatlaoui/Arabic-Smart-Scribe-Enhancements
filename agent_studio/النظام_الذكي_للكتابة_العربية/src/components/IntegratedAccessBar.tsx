import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import MyToolsPanel from './MyToolsPanel';
import AgentQuickSettings from './AgentQuickSettings';
import CustomAgentCreator from './CustomAgentCreator';
import {
  Wrench as Tools,
  Bot,
  Plus,
  Settings,
  Search,
  Command,
  Zap,
  Brain,
  Palette,
  Target,
  Activity,
  Play,
  Pause,
  Square,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2,
  X,
  ChevronUp,
  ChevronDown,
  Star,
  Heart,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  Share,
  Grid,
  List,
  Filter,
  MoreHorizontal
} from 'lucide-react';

interface QuickTool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  category: string;
  isActive: boolean;
  isFavorite: boolean;
  hotkey?: string;
}

interface ActiveAgent {
  id: string;
  name: string;
  state: 'idle' | 'working' | 'paused' | 'error';
  type: string;
  currentTask?: string;
  progress?: number;
}

interface IntegratedAccessBarProps {
  className?: string;
  position?: 'top' | 'bottom' | 'floating';
  autoHide?: boolean;
}

const IntegratedAccessBar: React.FC<IntegratedAccessBarProps> = ({
  className = '',
  position = 'floating',
  autoHide = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [quickTools, setQuickTools] = useState<QuickTool[]>([]);
  const [activeAgents, setActiveAgents] = useState<ActiveAgent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isAgentSettingsOpen, setIsAgentSettingsOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const barRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadQuickTools();
    loadActiveAgents();
    setupKeyboardShortcuts();
    
    if (autoHide) {
      setupAutoHide();
    }

    // تحديث دوري للوكلاء النشطين
    const interval = setInterval(loadActiveAgents, 5000);
    return () => clearInterval(interval);
  }, [autoHide]);

  const loadQuickTools = async () => {
    try {
      const response = await fetch('/api/tools/quick-access');
      const data = await response.json();
      
      if (data.success) {
        setQuickTools(data.tools);
      } else {
        // بيانات تجريبية
        setQuickTools(getDefaultQuickTools());
      }
    } catch (error) {
      setQuickTools(getDefaultQuickTools());
    }
  };

  const loadActiveAgents = async () => {
    try {
      const response = await fetch('/api/agents/active');
      const data = await response.json();
      
      if (data.success) {
        setActiveAgents(data.agents);
      } else {
        // بيانات تجريبية
        setActiveAgents(getDefaultActiveAgents());
      }
    } catch (error) {
      setActiveAgents(getDefaultActiveAgents());
    }
  };

  const getDefaultQuickTools = (): QuickTool[] => [
    {
      id: 'smart-editor',
      name: 'المحرر الذكي',
      icon: Brain,
      path: '/smart-editor',
      category: 'تحرير',
      isActive: true,
      isFavorite: true,
      hotkey: 'Ctrl+E'
    },
    {
      id: 'personal-style',
      name: 'التحكم الشخصي',
      icon: Palette,
      path: '/personal-style',
      category: 'تخصيص',
      isActive: true,
      isFavorite: true,
      hotkey: 'Ctrl+P'
    },
    {
      id: 'agent-studio',
      name: 'استوديو الوكلاء',
      icon: Bot,
      path: '/agent-studio',
      category: 'وكلاء',
      isActive: true,
      isFavorite: false,
      hotkey: 'Ctrl+A'
    },
    {
      id: 'workflow-builder',
      name: 'منشئ سير العمل',
      icon: Target,
      path: '/workflow-builder',
      category: 'إدارة',
      isActive: true,
      isFavorite: false,
      hotkey: 'Ctrl+W'
    }
  ];

  const getDefaultActiveAgents = (): ActiveAgent[] => [
    {
      id: 'cultural-maestro',
      name: 'الخبير الثقافي',
      state: 'working',
      type: 'cultural_maestro_agent',
      currentTask: 'تحليل السياق الثقافي',
      progress: 65
    },
    {
      id: 'idea-generator',
      name: 'مولد الأفكار',
      state: 'idle',
      type: 'idea_generator_agent'
    }
  ];

  const setupKeyboardShortcuts = () => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T لإظهار شريط الأدوات
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setIsVisible(!isVisible);
      }

      // Ctrl/Cmd + K للبحث السريع
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setIsSearchFocused(true);
      }

      // Escape لإخفاء البحث
      if (e.key === 'Escape' && isSearchFocused) {
        searchRef.current?.blur();
        setSearchQuery('');
        setIsSearchFocused(false);
      }

      // اختصارات الأدوات السريعة
      quickTools.forEach(tool => {
        if (tool.hotkey && isHotkeyPressed(e, tool.hotkey)) {
          e.preventDefault();
          navigateToTool(tool);
        }
      });
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  };

  const isHotkeyPressed = (e: KeyboardEvent, hotkey: string): boolean => {
    const parts = hotkey.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    
    const ctrlPressed = parts.includes('ctrl') ? e.ctrlKey : true;
    const shiftPressed = parts.includes('shift') ? e.shiftKey : true;
    const altPressed = parts.includes('alt') ? e.altKey : true;
    
    return e.key.toLowerCase() === key && ctrlPressed && shiftPressed && altPressed;
  };

  const setupAutoHide = () => {
    let hideTimeout: NodeJS.Timeout;

    const showBar = () => {
      setIsVisible(true);
      clearTimeout(hideTimeout);
    };

    const scheduleHide = () => {
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        if (!isSearchFocused && !isToolsPanelOpen && !isAgentSettingsOpen) {
          setIsVisible(false);
        }
      }, 3000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const threshold = position === 'top' ? 50 : window.innerHeight - 50;
      
      if (position === 'top' && e.clientY < threshold) {
        showBar();
      } else if (position === 'bottom' && e.clientY > threshold) {
        showBar();
      } else if (position === 'floating') {
        showBar();
        scheduleHide();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    if (position === 'floating') {
      scheduleHide();
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimeout);
    };
  };

  const navigateToTool = (tool: QuickTool) => {
    window.location.href = tool.path;
  };

  const toggleToolFavorite = async (toolId: string) => {
    try {
      const response = await fetch(`/api/tools/${toolId}/favorite`, { method: 'POST' });
      if (response.ok) {
        setQuickTools(prev => prev.map(tool => 
          tool.id === toolId ? { ...tool, isFavorite: !tool.isFavorite } : tool
        ));
      }
    } catch (error) {
      console.error('خطأ في تحديث المفضلة:', error);
    }
  };

  const openAgentSettings = (agentId: string) => {
    setSelectedAgentId(agentId);
    setIsAgentSettingsOpen(true);
  };

  const controlAgent = async (agentId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      const response = await fetch(`/api/agents/${agentId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        toast({
          title: "تم التحديث",
          description: `تم ${action === 'start' ? 'تشغيل' : action === 'pause' ? 'إيقاف مؤقت' : 'إيقاف'} الوكيل`
        });
        loadActiveAgents();
      }
    } catch (error) {
      toast({
        title: "خطأ في التحكم",
        description: "حدث خطأ أثناء تنفيذ الأمر",
        variant: "destructive"
      });
    }
  };

  const getAgentStateColor = (state: string) => {
    switch (state) {
      case 'working': return 'bg-blue-500';
      case 'idle': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getBarClasses = () => {
    const baseClasses = `
      fixed z-50 transition-all duration-300 ease-in-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0'}
      ${className}
    `;

    switch (position) {
      case 'top':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2 ${
          isVisible ? '' : '-translate-y-full'
        }`;
      case 'bottom':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2 ${
          isVisible ? '' : 'translate-y-full'
        }`;
      case 'floating':
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  const filteredTools = quickTools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isVisible && autoHide) {
    return null;
  }

  return (
    <TooltipProvider>
      <div ref={barRef} className={getBarClasses()}>
        <Card className={`backdrop-blur-lg bg-white/90 border-purple-200 shadow-xl ${
          isMinimized ? 'w-auto' : 'w-96'
        }`}>
          <CardContent className="p-3">
            {!isMinimized ? (
              <div className="space-y-3">
                {/* شريط البحث والتحكم */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      ref={searchRef}
                      placeholder="بحث سريع... (Ctrl+K)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsToolsPanelOpen(true)}
                          className="h-9 w-9 p-0"
                        >
                          <Tools className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>أدواتي</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsCreatorOpen(true)}
                          className="h-9 w-9 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>إنشاء وكيل جديد</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsMinimized(true)}
                          className="h-9 w-9 p-0"
                        >
                          <Minimize2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>تصغير</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* الأدوات السريعة */}
                {filteredTools.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tools className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">الأدوات السريعة</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredTools.slice(0, 4).map((tool) => {
                        const IconComponent = tool.icon;
                        return (
                          <div
                            key={tool.id}
                            className="relative group cursor-pointer"
                            onClick={() => navigateToTool(tool)}
                          >
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-50 transition-all">
                              <div className="p-1 bg-purple-100 rounded">
                                <IconComponent className="h-3 w-3 text-purple-600" />
                              </div>
                              <span className="text-xs font-medium truncate">
                                {tool.name}
                              </span>
                              {tool.isFavorite && (
                                <Heart className="h-3 w-3 text-red-500 fill-current ml-auto" />
                              )}
                            </div>
                            {tool.hotkey && (
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {tool.hotkey}
                                </Badge>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* الوكلاء النشطين */}
                {activeAgents.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">الوكلاء النشطين</span>
                      <Badge variant="outline" className="text-xs">
                        {activeAgents.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {activeAgents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 group"
                        >
                          <div className={`w-2 h-2 rounded-full ${getAgentStateColor(agent.state)}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{agent.name}</div>
                            {agent.currentTask && (
                              <div className="text-xs text-gray-500 truncate">
                                {agent.currentTask}
                              </div>
                            )}
                            {agent.progress !== undefined && (
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full transition-all"
                                  style={{ width: `${agent.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openAgentSettings(agent.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>إعدادات الوكيل</TooltipContent>
                            </Tooltip>
                            
                            {agent.state === 'working' ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => controlAgent(agent.id, 'pause')}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Pause className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>إيقاف مؤقت</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => controlAgent(agent.id, 'start')}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Play className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>تشغيل</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // الوضع المصغر
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsMinimized(false)}
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  {quickTools.filter(t => t.isFavorite).slice(0, 3).map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigateToTool(tool)}
                            className="h-8 w-8 p-0"
                          >
                            <IconComponent className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{tool.name}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
                <Badge variant="outline" className="text-xs">
                  {activeAgents.filter(a => a.state === 'working').length}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* الحوارات */}
        <Dialog open={isToolsPanelOpen} onOpenChange={setIsToolsPanelOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>أدواتي ووكلائي</DialogTitle>
            </DialogHeader>
            <MyToolsPanel />
          </DialogContent>
        </Dialog>

        {selectedAgentId && (
          <AgentQuickSettings
            isOpen={isAgentSettingsOpen}
            onClose={() => {
              setIsAgentSettingsOpen(false);
              setSelectedAgentId(null);
            }}
            agentId={selectedAgentId}
          />
        )}

        <CustomAgentCreator
          isOpen={isCreatorOpen}
          onClose={() => setIsCreatorOpen(false)}
          onAgentCreated={(agent) => {
            loadActiveAgents();
            toast({
              title: "تم إنشاء الوكيل",
              description: `تم إنشاء الوكيل "${agent.name}" بنجاح`
            });
          }}
        />
      </div>
    </TooltipProvider>
  );
};

export default IntegratedAccessBar;
