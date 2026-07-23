import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  imageOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  to?: string;
  textClassName?: string;
}

export function Logo({
  className = '',
  size = 'md',
  showText = true,
  to,
  textClassName = 'text-white',
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-9 w-auto',
    lg: 'h-12 w-auto',
  };

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="Wayfare Global Logo"
        className={`${sizeClasses[size]} rounded-xl object-contain shadow-sm border border-slate-700/50 bg-slate-900/80 p-0.5`}
      />
      {showText && (
        <span className={`font-display text-xl font-black tracking-tight ${textClassName}`}>
          Wayfare <span className="text-teal-400 font-semibold text-sm tracking-normal">Global</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center focus-visible:outline-none" aria-label="Wayfare Global Home">
        {content}
      </Link>
    );
  }

  return content;
}
