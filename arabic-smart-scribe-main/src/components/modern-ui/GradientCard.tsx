
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GradientCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  gradient: string;
  className?: string;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  title,
  description,
  icon,
  children,
  gradient,
  className
}) => {
  return (
    <Card className={cn(
      "relative overflow-hidden border-0 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-105",
      className
    )}>
      <div className={cn("absolute inset-0 opacity-10", gradient)} />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center space-x-3 space-x-reverse text-xl">
          <div className={cn("p-3 rounded-xl", gradient)}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        {children}
      </CardContent>
    </Card>
  );
};
