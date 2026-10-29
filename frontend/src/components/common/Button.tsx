import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 tracking-wide select-none focus:outline-none focus:ring-1 focus:ring-gallery-ink disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-sm',
    md: 'text-sm px-5 py-2.5 rounded-sm',
    lg: 'text-base px-7 py-3.5 rounded-sm',
  }[size];

  const variantClasses = {
    primary:
      'bg-gallery-ink text-gallery-milk hover:bg-neutral-800 active:bg-black shadow-subtle',
    secondary:
      'bg-gallery-stone text-gallery-ink hover:bg-[#EBE6E0] border border-gallery-border',
    outline:
      'bg-transparent text-gallery-ink border border-gallery-ink hover:bg-gallery-ink hover:text-gallery-milk',
    ghost:
      'bg-transparent text-gallery-ink hover:bg-gallery-stone',
  }[variant];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
