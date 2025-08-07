import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { ValidationResult } from '@/lib/validation';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  validation?: ValidationResult;
  description?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, id, validation, description, className, ...props }, ref) => {
    const hasError = validation && !validation.isValid;
    
    return (
      <div className="space-y-2 animate-slide-up">
        <Label 
          htmlFor={id} 
          className={cn(
            "block text-sm font-medium",
            hasError ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"
          )}
        >
          {label}
        </Label>
        
        <div className="relative">
          <Input
            id={id}
            ref={ref}
            className={cn(
              "transition-all duration-300",
              hasError 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                : "border-input focus:border-primary focus:ring-primary",
              className
            )}
            {...props}
          />
          
          {hasError && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
            </div>
          )}
        </div>
        
        {hasError && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
            <AlertCircle className="h-3 w-3" />
            {validation.error}
          </p>
        )}
        
        {description && !hasError && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

// TextArea版も作成
interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  validation?: ValidationResult;
  description?: string;
}

export const FormTextArea = React.forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ label, id, validation, description, className, ...props }, ref) => {
    const hasError = validation && !validation.isValid;
    
    return (
      <div className="space-y-2 animate-slide-up">
        <Label 
          htmlFor={id}
          className={cn(
            "block text-sm font-medium",
            hasError ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"
          )}
        >
          {label}
        </Label>
        
        <div className="relative">
          <textarea
            id={id}
            ref={ref}
            className={cn(
              "block w-full px-3 py-2 bg-background border rounded-md shadow-sm text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
              hasError 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                : "border-input focus:border-primary focus:ring-primary hover:border-primary/50",
              className
            )}
            {...props}
          />
        </div>
        
        {hasError && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
            <AlertCircle className="h-3 w-3" />
            {validation.error}
          </p>
        )}
        
        {description && !hasError && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    );
  }
);

FormTextArea.displayName = "FormTextArea";