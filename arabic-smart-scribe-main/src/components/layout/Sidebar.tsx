import React from 'react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Search, 
  PenTool, 
  Video, 
  Eye,
  Settings,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
}

const navigationItems = [
  {
    id: 'text',
    label: 'محرر النصوص',
    icon: FileText,
    description: 'كتابة وتحرير النصوص'
  },
  {
    id: 'research',
    label: 'البحث',
    icon: Search,
    description: 'البحث والاستطلاع'
  },
  {
    id: 'writing',
    label: 'مساعد الكتابة',
    icon: PenTool,
    description: 'أدوات الكتابة المتقدمة'
  },
  {
    id: 'video-to-book',
    label: 'فيديو إلى كتاب',
    icon: Video,
    description: 'تحويل الفيديوهات إلى كتب'
  },
  {
    id: 'shahid',
    label: 'الشاهد الاحترافي',
    icon: Eye,
    description: 'المحرك الروائي المتكامل'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { activePanel, setActivePanel, toggleSidebar } = useUIStore();

  return (
    <div className={cn(
      "bg-card border-l border-border transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-lg font-semibold text-foreground">
              الكاتب الذكي
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-right",
                  collapsed && "px-2"
                )}
                onClick={() => setActivePanel(item.id as any)}
              >
                <Icon className={cn("h-4 w-4 ml-2", collapsed && "ml-0")} />
                {!collapsed && (
                  <div className="text-right">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-right",
            collapsed && "px-2"
          )}
          onClick={() => {/* Handle settings */}}
        >
          <Settings className={cn("h-4 w-4 ml-2", collapsed && "ml-0")} />
          {!collapsed && "الإعدادات"}
        </Button>
      </div>
    </div>
  );
};