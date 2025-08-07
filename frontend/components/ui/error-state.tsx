import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'エラーが発生しました',
  description = '問題が発生しました。もう一度お試しください。',
  error,
  onRetry,
  className,
}) => {
  return (
    <Card className={cn("border-destructive/50 bg-destructive/5", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-16 w-16 mb-6 text-destructive opacity-75" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
        {error && (
          <div className="bg-muted/50 p-3 rounded-md mb-6 max-w-md">
            <p className="text-sm text-muted-foreground font-mono break-all">
              {error}
            </p>
          </div>
        )}
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            再試行
          </Button>
        )}
      </CardContent>
    </Card>
  );
};