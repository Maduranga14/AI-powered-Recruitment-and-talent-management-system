import React from 'react';
import { twMerge } from 'tailwind-merge';
type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}
const base =
'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
const variants: Record<Variant, string> = {
  primary:
  'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-lift active:scale-[0.98]',
  secondary:
  'bg-brand-50 text-brand-700 hover:bg-brand-100 active:scale-[0.98]',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  outline:
  'border border-slate-300 text-slate-700 bg-white hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]'
};
const sizes: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3.5'
};
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props} />);


}