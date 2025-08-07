import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        {Icon && (
          <Icon className="h-16 w-16 mb-6 text-muted-foreground opacity-50" />
        )}
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground mb-6 max-w-md">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};