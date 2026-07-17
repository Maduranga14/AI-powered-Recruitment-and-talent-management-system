import React, { forwardRef, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

interface PasswordInputProps
  extends FieldProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

const inputBase =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

export const Input = forwardRef<
  HTMLInputElement,
  FieldProps & React.InputHTMLAttributes<HTMLInputElement>
>(({ label, hint, error, id, className, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={twMerge(
          inputBase,
          error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});
Input.displayName = 'Input';

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, hint, error, id, className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={show ? 'text' : 'password'}
            className={twMerge(
              inputBase,
              'pr-11',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label={show ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ label, hint, error, id, className, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        ref={ref}
        className={twMerge(inputBase, 'min-h-[110px] resize-y', error && 'border-red-400', className)}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';

export const Select = forwardRef<
  HTMLSelectElement,
  FieldProps & React.SelectHTMLAttributes<HTMLSelectElement>
>(({ label, error, id, className, children, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={inputId}
        ref={ref}
        className={twMerge(inputBase, 'appearance-none bg-white pr-10', className)}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});
Select.displayName = 'Select';