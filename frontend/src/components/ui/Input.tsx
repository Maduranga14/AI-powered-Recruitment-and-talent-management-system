import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}
const inputBase =
'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
export const Input = forwardRef<
  HTMLInputElement,
  FieldProps & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ label, hint, error, id, className, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
      {label &&
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700">
          
          {label}
        </label>
        }
      <input
          id={inputId}
          ref={ref}
          className={twMerge(
            inputBase,
            error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
            className
          )}
          aria-invalid={!!error}
          {...props} />
        
      {error ?
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> :
        hint ?
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p> :
        null}
    </div>);

  });
Input.displayName = 'Input';
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ label, hint, error, id, className, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
      {label &&
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700">
          
          {label}
        </label>
        }
      <textarea
          id={inputId}
          ref={ref}
          className={twMerge(
            inputBase,
            'min-h-[110px] resize-y',
            error && 'border-red-400',
            className
          )}
          {...props} />
        
      {hint && !error &&
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
        }
      {error &&
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
        }
    </div>);

  });
Textarea.displayName = 'Textarea';
export const Select = forwardRef<
  HTMLSelectElement,
  FieldProps & React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ label, error, id, className, children, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
      {label &&
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700">
          
          {label}
        </label>
        }
      <select
          id={inputId}
          ref={ref}
          className={twMerge(
            inputBase,
            'appearance-none bg-white pr-10',
            className
          )}
          {...props}>
          
        {children}
      </select>
    </div>);

  });
Select.displayName = 'Select';