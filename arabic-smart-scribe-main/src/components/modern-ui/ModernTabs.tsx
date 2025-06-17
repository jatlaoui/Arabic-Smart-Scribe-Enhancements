
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ModernTabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface ModernTabTriggerProps {
  value: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export const ModernTabs: React.FC<ModernTabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className
}) => {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("space-y-8", className)}
    >
      {children}
    </Tabs>
  );
};

export const ModernTabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <TabsList className={cn(
      "grid w-full bg-white/50 backdrop-blur-sm border shadow-lg rounded-xl p-2",
      className
    )}>
      {children}
    </TabsList>
  );
};

export const ModernTabTrigger: React.FC<ModernTabTriggerProps> = ({
  value,
  icon,
  label,
  badge
}) => {
  return (
    <TabsTrigger
      value={value}
      className="flex items-center space-x-3 space-x-reverse px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300 hover:shadow-md relative"
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </TabsTrigger>
  );
};

export const ModernTabContent = TabsContent;
